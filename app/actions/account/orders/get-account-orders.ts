"use server";

import { db } from "@/db/db";
import {
  orderItemsSchema,
  ordersSchema,
  paymentsSchema,
  type OrderPaymentTypes,
  type OrderTypes,
} from "@/db/schemas/orders.schema";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { requireCustomerSession } from "../_shared/require-customer-session";

export type AccountOrderListItem = {
  orderNumber: string;
  createdAt: Date;
  orderStatus: OrderTypes["orderStatus"];
  total: number;
  paymentStatus: OrderPaymentTypes["status"] | null;
  itemCount: number;
};

/** Epoch-ms window; `null` means unbounded on that side. */
export type OrdersDateRange = { fromMs: number | null; toMs: number | null };

// Whether the customer has any order at all — used to tell the true "no orders"
// state apart from "no orders in the selected period" without loading them all.
export async function hasAccountOrders(): Promise<boolean> {
  const session = await requireCustomerSession();
  try {
    const rows = await db
      .select({ id: ordersSchema.id })
      .from(ordersSchema)
      .where(eq(ordersSchema.userId, session.user.id))
      .limit(1);
    return rows.length > 0;
  } catch (error) {
    console.error("[hasAccountOrders]", error);
    return false;
  }
}

export async function getAccountOrders(range?: OrdersDateRange): Promise<AccountOrderListItem[]> {
  const session = await requireCustomerSession();
  const userId = session.user.id;

  try {
    const conditions = [eq(ordersSchema.userId, userId)];
    if (range?.fromMs != null) conditions.push(gte(ordersSchema.createdAt, new Date(range.fromMs)));
    if (range?.toMs != null) conditions.push(lte(ordersSchema.createdAt, new Date(range.toMs)));

    const orders = await db
      .select()
      .from(ordersSchema)
      .where(and(...conditions))
      .orderBy(desc(ordersSchema.createdAt));

    if (orders.length === 0) return [];

    const orderIds = orders.map((order) => order.id);

    const items = await db
      .select({
        orderId: orderItemsSchema.orderId,
        quantity: orderItemsSchema.quantity,
        unitPrice: orderItemsSchema.unitPrice,
      })
      .from(orderItemsSchema)
      .where(inArray(orderItemsSchema.orderId, orderIds));

    const payments = await db
      .select({
        orderId: paymentsSchema.orderId,
        status: paymentsSchema.status,
        amount: paymentsSchema.amount,
      })
      .from(paymentsSchema)
      .where(inArray(paymentsSchema.orderId, orderIds));

    const subtotalByOrder = new Map<string, number>();
    const countByOrder = new Map<string, number>();
    for (const item of items) {
      const price = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      subtotalByOrder.set(item.orderId, (subtotalByOrder.get(item.orderId) ?? 0) + price * quantity);
      countByOrder.set(item.orderId, (countByOrder.get(item.orderId) ?? 0) + quantity);
    }
    const paymentByOrder = new Map(payments.map((payment) => [payment.orderId, payment]));

    return orders.map((order) => {
      const delivery =
        order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : Number(order.deliveryPrice) || 0;
      const payment = paymentByOrder.get(order.id);
      const computedTotal = (subtotalByOrder.get(order.id) ?? 0) + delivery;

      return {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        total: payment ? Number(payment.amount) : computedTotal,
        paymentStatus: payment?.status ?? null,
        itemCount: countByOrder.get(order.id) ?? 0,
      };
    });
  } catch (error) {
    console.error("[getAccountOrders]", error);
    return [];
  }
}
