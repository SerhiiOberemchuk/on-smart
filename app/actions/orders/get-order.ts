"use server";

import { cacheLife, cacheTag } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import {
  orderItemsSchema,
  OrderItemsTypes,
  OrderPaymentTypes,
  ordersSchema,
  OrderTypes,
  paymentsSchema,
} from "@/db/schemas/orders.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { withRetrySelective } from "@/utils/with-retry-selective";

import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";

const ORDERS_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;

export type GetOrderResponseType = Promise<{
  success: boolean;
  order: OrderTypes | null;
  error?: undefined | unknown;
}>;

export async function getOrderByNumberAction(
  orderNumber: OrderTypes["orderNumber"],
): GetOrderResponseType {
  "use cache";

  if (!orderNumber) {
    return { success: false, order: null, error: "Order number is required" };
  }

  cacheLife("minutes");
  cacheTag(CACHE_TAG_GET_ORDER_INFO);

  try {
    const order = await db.select().from(ordersSchema).where(eq(ordersSchema.orderNumber, orderNumber));

    return {
      success: true,
      order: order[0] ?? null,
      error: null,
    };
  } catch (error) {
    return { error, success: false, order: null };
  }
}

export type GetOrderFullInfoByIdResponseType = Promise<{
  order: OrderTypes | null;
  orderItems: OrderItemsTypes[] | null;
  payments: OrderPaymentTypes | null;
  error: unknown;
}>;

export async function getOrderFullInfoById({
  id,
}: Pick<OrderTypes, "id">): GetOrderFullInfoByIdResponseType {
  "use cache";

  if (!id) {
    return { error: "Order id is required", order: null, orderItems: null, payments: null };
  }

  cacheLife("minutes");
  cacheTag(CACHE_TAGS.orders.byId(id));

  try {
    const [order] = await db.select().from(ordersSchema).where(eq(ordersSchema.id, id));
    const orderItems = await db.select().from(orderItemsSchema).where(eq(orderItemsSchema.orderId, id));
    const [payments] = await db.select().from(paymentsSchema).where(eq(paymentsSchema.orderId, id));

    return { order: order ?? null, orderItems, error: null, payments: payments ?? null };
  } catch (error) {
    return { error, order: null, orderItems: null, payments: null };
  }
}

export type GetOrdersAllActionResponseType = Promise<{
  orders: OrderListItem[] | null;
  error: unknown | null;
}>;

export type OrderListItem = OrderTypes & {
  itemsSubtotal: number;
  orderTotal: number;
};

export async function getOrdersAllAction(): GetOrdersAllActionResponseType {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAG_GET_ORDER_INFO);

  try {
    const [orders, orderItems] = await withRetrySelective(
      () =>
        Promise.all([
          db.select().from(ordersSchema),
          db
            .select({
              orderId: orderItemsSchema.orderId,
              quantity: orderItemsSchema.quantity,
              unitPrice: orderItemsSchema.unitPrice,
            })
            .from(orderItemsSchema),
        ]),
      ORDERS_READ_RETRY_OPTIONS,
    );

    const subtotalByOrderId = new Map<string, number>();

    for (const item of orderItems) {
      const price = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      const nextSubtotal = (subtotalByOrderId.get(item.orderId) ?? 0) + price * quantity;
      subtotalByOrderId.set(item.orderId, nextSubtotal);
    }

    return {
      orders: orders.map((order) => {
        const itemsSubtotal = subtotalByOrderId.get(order.id) ?? 0;
        const delivery =
          order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : Number(order.deliveryPrice) || 0;

        return {
          ...order,
          itemsSubtotal,
          orderTotal: itemsSubtotal + delivery,
        };
      }),
      error: null,
    };
  } catch (error) {
    return { error, orders: null };
  }
}
