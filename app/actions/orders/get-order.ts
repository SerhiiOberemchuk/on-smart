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
  payments: OrderPaymentTypes | null;
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
    const [payments] = await db.select().from(paymentsSchema).where(eq(paymentsSchema.orderId, id));
    return { order, orderItems, error: null, payments };
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
  cacheLife("minutes");
  cacheTag(CACHE_TAG_GET_ORDER_INFO);
  try {
    const [orders, orderItems] = await Promise.all([
      db.select().from(ordersSchema),
      db
        .select({
          orderId: orderItemsSchema.orderId,
          quantity: orderItemsSchema.quantity,
          unitPrice: orderItemsSchema.unitPrice,
        })
        .from(orderItemsSchema),
    ]);

    const subtotalByOrderId = new Map<string, number>();

    for (const item of orderItems) {
      const price = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      const nextSubtotal = (subtotalByOrderId.get(item.orderId) ?? 0) + price * quantity;
      subtotalByOrderId.set(item.orderId, nextSubtotal);
    }

    const enrichedOrders: OrderListItem[] = orders.map((order) => {
      const itemsSubtotal = subtotalByOrderId.get(order.id) ?? 0;
      const delivery = order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : Number(order.deliveryPrice) || 0;

      return {
        ...order,
        itemsSubtotal,
        orderTotal: itemsSubtotal + delivery,
      };
    });

    return {
      orders: enrichedOrders,
      error: null,
    };
  } catch (error) {
    return { error, orders: null };
  }
}
