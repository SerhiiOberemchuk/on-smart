"use server";

import { db } from "@/db/db";
import { orderItemsSchema, ordersSchema } from "@/db/schemas/orders.schema";
import { withdrawalRequestsSchema } from "@/db/schemas/withdrawal-requests.schema";
import type { WithdrawalStatusType } from "@/types/withdrawal.types";
import { desc, eq, inArray } from "drizzle-orm";
import { requireCustomerSession } from "../_shared/require-customer-session";

export type WithdrawalOrderOption = {
  orderNumber: string;
  createdAt: Date;
  /** First item titles, for recognizing the order in the picker. */
  summary: string;
  /** Set when a withdrawal request already exists for this order. */
  withdrawalStatus: WithdrawalStatusType | null;
};

export type AccountWithdrawalData = {
  nome: string;
  email: string;
  orders: WithdrawalOrderOption[];
};

// Orders the logged-in customer can pick in the account withdrawal function
// (art. 54-bis: the consumer confirms the contract identification instead of
// typing it). CANCELED/REFUNDED orders are excluded; orders with an existing
// request are returned with their status so the page can show them.
export async function getAccountWithdrawalOrders(): Promise<AccountWithdrawalData> {
  const session = await requireCustomerSession();
  const userId = session.user.id;

  try {
    const orders = await db
      .select({
        id: ordersSchema.id,
        orderNumber: ordersSchema.orderNumber,
        createdAt: ordersSchema.createdAt,
        orderStatus: ordersSchema.orderStatus,
      })
      .from(ordersSchema)
      .where(eq(ordersSchema.userId, userId))
      .orderBy(desc(ordersSchema.createdAt));

    const visible = orders.filter(
      (order) => order.orderStatus !== "CANCELED" && order.orderStatus !== "REFUNDED",
    );
    if (visible.length === 0) {
      return { nome: session.user.name ?? "", email: session.user.email, orders: [] };
    }

    const orderIds = visible.map((order) => order.id);
    const [items, withdrawals] = await Promise.all([
      db
        .select({
          orderId: orderItemsSchema.orderId,
          title: orderItemsSchema.title,
        })
        .from(orderItemsSchema)
        .where(inArray(orderItemsSchema.orderId, orderIds)),
      db
        .select({
          orderId: withdrawalRequestsSchema.orderId,
          status: withdrawalRequestsSchema.status,
        })
        .from(withdrawalRequestsSchema)
        .where(inArray(withdrawalRequestsSchema.orderId, orderIds)),
    ]);

    const titlesByOrder = new Map<string, string[]>();
    for (const item of items) {
      const list = titlesByOrder.get(item.orderId) ?? [];
      list.push(item.title);
      titlesByOrder.set(item.orderId, list);
    }
    const withdrawalByOrder = new Map(withdrawals.map((w) => [w.orderId, w.status]));

    return {
      nome: session.user.name ?? "",
      email: session.user.email,
      orders: visible.map((order) => {
        const titles = titlesByOrder.get(order.id) ?? [];
        const summary =
          titles.slice(0, 2).join(", ") + (titles.length > 2 ? ` +${titles.length - 2}` : "");
        return {
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          summary,
          withdrawalStatus: withdrawalByOrder.get(order.id) ?? null,
        };
      }),
    };
  } catch (error) {
    console.error("[getAccountWithdrawalOrders]", error);
    return { nome: "", email: "", orders: [] };
  }
}
