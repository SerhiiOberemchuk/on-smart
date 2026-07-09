"use server";

import { user } from "@/auth-schema";
import { db } from "@/db/db";
import { customerProfilesSchema } from "@/db/schemas/customer-profile.schema";
import { orderItemsSchema, ordersSchema, paymentsSchema } from "@/db/schemas/orders.schema";
import { userAddressesSchema } from "@/db/schemas/user-addresses.schema";
import { wishlistItemsSchema } from "@/db/schemas/wishlist.schema";
import type { ClientType, OrderStatusTypes } from "@/types/orders.types";
import type { PaymentStatusTypes } from "@/types/payments.types";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { isNull, ne, or } from "drizzle-orm";
import { requireAdminSession } from "../_shared/require-admin-session";

const CUSTOMERS_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;

// Orders that represent real revenue (payment captured / being fulfilled) —
// PENDING_PAYMENT / CANCELED / REFUNDED are excluded from lifetime value.
const PAID_ORDER_STATUSES = new Set<OrderStatusTypes>([
  "PAID",
  "FULFILLING",
  "SHIPPED",
  "READY_FOR_PICKUP",
  "COMPLETED",
]);
const PAID_PAYMENT_STATUSES = new Set<PaymentStatusTypes>(["SUCCESS", "PAYED"]);
const NEW_CUSTOMER_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export type AdminCustomerRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  banned: boolean;
  createdAt: Date;
  clientType: ClientType | null;
  phone: string | null;
  companyName: string | null;
  city: string | null;
  ordersCount: number;
  paidOrdersCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  wishlistCount: number;
};

export type AdminCustomersSummary = {
  total: number;
  newLast30: number;
  verified: number;
  withOrders: number;
  business: number;
  totalRevenue: number;
};

export type AdminCustomersOverview = {
  customers: AdminCustomerRow[];
  summary: AdminCustomersSummary;
  error: unknown | null;
};

const EMPTY_SUMMARY: AdminCustomersSummary = {
  total: 0,
  newLast30: 0,
  verified: 0,
  withOrders: 0,
  business: 0,
  totalRevenue: 0,
};

/**
 * One-shot overview of every registered customer (admins excluded) with the
 * order/engagement aggregates a shop owner needs: lifetime value, order count,
 * last purchase, wishlist size. Analytics are computed here (single server
 * clock) so the client component only filters/sorts — no date-driven hydration
 * mismatch. Mirrors the fan-out read style of `getOrdersAllAction`.
 */
export async function getCustomersOverview(): Promise<AdminCustomersOverview> {
  await requireAdminSession();

  try {
    const [users, profiles, orders, orderItems, payments, wishlist, addresses] =
      await withRetrySelective(
        () =>
          Promise.all([
            db
              .select({
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                banned: user.banned,
                createdAt: user.createdAt,
              })
              .from(user)
              .where(or(isNull(user.role), ne(user.role, "admin"))),
            db
              .select({
                userId: customerProfilesSchema.userId,
                clientType: customerProfilesSchema.clientType,
                phone: customerProfilesSchema.numeroTelefono,
                ragioneSociale: customerProfilesSchema.ragioneSociale,
              })
              .from(customerProfilesSchema),
            db
              .select({
                id: ordersSchema.id,
                userId: ordersSchema.userId,
                orderStatus: ordersSchema.orderStatus,
                deliveryMethod: ordersSchema.deliveryMethod,
                deliveryPrice: ordersSchema.deliveryPrice,
                createdAt: ordersSchema.createdAt,
              })
              .from(ordersSchema),
            db
              .select({
                orderId: orderItemsSchema.orderId,
                quantity: orderItemsSchema.quantity,
                unitPrice: orderItemsSchema.unitPrice,
              })
              .from(orderItemsSchema),
            db
              .select({
                orderId: paymentsSchema.orderId,
                status: paymentsSchema.status,
                amount: paymentsSchema.amount,
              })
              .from(paymentsSchema),
            db.select({ userId: wishlistItemsSchema.userId }).from(wishlistItemsSchema),
            db
              .select({
                userId: userAddressesSchema.userId,
                citta: userAddressesSchema.citta,
                isDefaultShipping: userAddressesSchema.isDefaultShipping,
              })
              .from(userAddressesSchema),
          ]),
        CUSTOMERS_READ_RETRY_OPTIONS,
      );

    const subtotalByOrder = new Map<string, number>();
    for (const item of orderItems) {
      const price = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      subtotalByOrder.set(item.orderId, (subtotalByOrder.get(item.orderId) ?? 0) + price * quantity);
    }

    // Best captured amount per order (an order may have several payment attempts).
    const paidAmountByOrder = new Map<string, number>();
    for (const payment of payments) {
      if (!PAID_PAYMENT_STATUSES.has(payment.status)) continue;
      const amount = Number(payment.amount) || 0;
      paidAmountByOrder.set(payment.orderId, Math.max(paidAmountByOrder.get(payment.orderId) ?? 0, amount));
    }

    const profileByUser = new Map(profiles.map((profile) => [profile.userId, profile]));

    const wishlistByUser = new Map<string, number>();
    for (const item of wishlist) {
      wishlistByUser.set(item.userId, (wishlistByUser.get(item.userId) ?? 0) + 1);
    }

    // Prefer the default shipping city; fall back to the first address on file.
    const cityByUser = new Map<string, string>();
    for (const address of addresses) {
      if (!address.citta) continue;
      if (address.isDefaultShipping || !cityByUser.has(address.userId)) {
        cityByUser.set(address.userId, address.citta);
      }
    }

    type OrderAgg = { count: number; paidCount: number; spent: number; last: Date | null };
    const orderAggByUser = new Map<string, OrderAgg>();
    for (const order of orders) {
      if (!order.userId) continue;
      const agg = orderAggByUser.get(order.userId) ?? { count: 0, paidCount: 0, spent: 0, last: null };
      agg.count += 1;
      if (!agg.last || order.createdAt > agg.last) agg.last = order.createdAt;

      const paidAmount = paidAmountByOrder.get(order.id);
      const isRevenue = paidAmount !== undefined || PAID_ORDER_STATUSES.has(order.orderStatus);
      if (isRevenue) {
        const delivery =
          order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : Number(order.deliveryPrice) || 0;
        agg.paidCount += 1;
        agg.spent += paidAmount ?? (subtotalByOrder.get(order.id) ?? 0) + delivery;
      }
      orderAggByUser.set(order.userId, agg);
    }

    const nowMs = Date.now();
    const summary: AdminCustomersSummary = { ...EMPTY_SUMMARY, total: users.length };

    const customers: AdminCustomerRow[] = users.map((account) => {
      const profile = profileByUser.get(account.id);
      const agg = orderAggByUser.get(account.id);
      const clientType = profile?.clientType ?? null;
      const ordersCount = agg?.count ?? 0;

      if (account.emailVerified) summary.verified += 1;
      if (nowMs - new Date(account.createdAt).getTime() <= NEW_CUSTOMER_WINDOW_MS) summary.newLast30 += 1;
      if (ordersCount > 0) summary.withOrders += 1;
      if (clientType === "azienda") summary.business += 1;
      summary.totalRevenue += agg?.spent ?? 0;

      return {
        id: account.id,
        name: account.name,
        email: account.email,
        emailVerified: Boolean(account.emailVerified),
        banned: Boolean(account.banned),
        createdAt: account.createdAt,
        clientType,
        phone: profile?.phone ?? null,
        companyName: profile?.ragioneSociale ?? null,
        city: cityByUser.get(account.id) ?? null,
        ordersCount,
        paidOrdersCount: agg?.paidCount ?? 0,
        totalSpent: agg?.spent ?? 0,
        lastOrderAt: agg?.last ?? null,
        wishlistCount: wishlistByUser.get(account.id) ?? 0,
      };
    });

    customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { customers, summary, error: null };
  } catch (error) {
    console.error("[getCustomersOverview]", error);
    return { customers: [], summary: EMPTY_SUMMARY, error };
  }
}
