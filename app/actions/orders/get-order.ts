"use server";

import { db } from "@/db/db";
import {
  orderItemsSchema,
  OrderItemsTypes,
  OrderPaymentTypes,
  ordersSchema,
  OrderTypes,
  paymentsSchema,
} from "@/db/schemas/orders.schema";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";

export type GetOrderResponseType = Promise<{
  success: boolean;
  order: OrderTypes | null;
  error?: undefined | unknown;
}>;

export async function getOrderByNumberAction(
  orderNumber: OrderTypes["orderNumber"],
): GetOrderResponseType {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG_GET_ORDER_INFO);
  try {
    const order = await db
      .select()
      .from(ordersSchema)
      .where(eq(ordersSchema.orderNumber, orderNumber));
    return {
      success: true,
      order: order[0],
      error: null,
    };
  } catch (error) {
    return { error, success: false, order: null };
  }
}

export type GetOrderFullInfoByIdResponseType = Promise<{
  order: OrderTypes | null;
  orderItems: OrderItemsTypes[] | null;
  payments: OrderPaymentTypes[] | null;
  error: unknown;
}>;

export async function getOrderFullInfoById({
  id,
}: Pick<OrderTypes, "id">): GetOrderFullInfoByIdResponseType {
  "use cache";
  cacheLife("minutes");
  cacheTag(id);
  try {
    const [order] = await db.select().from(ordersSchema).where(eq(ordersSchema.id, id));
    const orderItems = await db
      .select()
      .from(orderItemsSchema)
      .where(eq(orderItemsSchema.orderId, id));
    const payments = await db.select().from(paymentsSchema).where(eq(paymentsSchema.orderId, id));
    return { order, orderItems, error: null, payments };
  } catch (error) {
    return { error, order: null, orderItems: null, payments: null };
  }
}

export type GetOrdersAllActionResponseType = Promise<{
  orders: OrderTypes[] | null;
  error: unknown | null;
}>;

export async function getOrdersAllAction(): GetOrdersAllActionResponseType {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG_GET_ORDER_INFO);
  try {
    const orders = await db.select().from(ordersSchema);
    return {
      orders,
      error: null,
    };
  } catch (error) {
    return { error, orders: null };
  }
}
