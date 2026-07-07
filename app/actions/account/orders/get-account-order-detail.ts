"use server";

import { db } from "@/db/db";
import {
  orderItemsSchema,
  ordersSchema,
  paymentsSchema,
  type OrderItemsTypes,
  type OrderPaymentTypes,
  type OrderTypes,
} from "@/db/schemas/orders.schema";
import {
  withdrawalRequestsSchema,
  type WithdrawalRequestType,
} from "@/db/schemas/withdrawal-requests.schema";
import { and, desc, eq } from "drizzle-orm";
import { requireCustomerSession } from "../_shared/require-customer-session";

export type AccountOrderDetail = {
  order: OrderTypes;
  items: OrderItemsTypes[];
  payment: OrderPaymentTypes | null;
  withdrawal: WithdrawalRequestType | null;
};

export async function getAccountOrderDetail(orderNumber: string): Promise<AccountOrderDetail | null> {
  const session = await requireCustomerSession();
  const userId = session.user.id;
  if (!orderNumber) return null;

  try {
    // Ownership is enforced in the WHERE clause — a mismatch yields null (renders 404).
    const [order] = await db
      .select()
      .from(ordersSchema)
      .where(and(eq(ordersSchema.orderNumber, orderNumber), eq(ordersSchema.userId, userId)))
      .limit(1);

    if (!order) return null;

    const items = await db
      .select()
      .from(orderItemsSchema)
      .where(eq(orderItemsSchema.orderId, order.id));
    const [payment] = await db
      .select()
      .from(paymentsSchema)
      .where(eq(paymentsSchema.orderId, order.id))
      .limit(1);
    const [withdrawal] = await db
      .select()
      .from(withdrawalRequestsSchema)
      .where(eq(withdrawalRequestsSchema.orderId, order.id))
      .orderBy(desc(withdrawalRequestsSchema.createdAt))
      .limit(1);

    return { order, items, payment: payment ?? null, withdrawal: withdrawal ?? null };
  } catch (error) {
    console.error("[getAccountOrderDetail]", error);
    return null;
  }
}
