"use server";

import { cacheLife, cacheTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
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
import { isBuildPhase } from "@/utils/guard-build";
import { withRetrySelective } from "@/utils/with-retry-selective";

import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";

const ORDERS_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;
const BUILD_PHASE_SKIP_ERROR = "skipped: build phase";

export type GetOrderResponseType = Promise<{
  success: boolean;
  order: OrderTypes | null;
  error?: undefined | unknown;
}>;

async function getOrderByNumberCachedCore(
  orderNumber: OrderTypes["orderNumber"],
): Promise<{
  success: boolean;
  order: OrderTypes | null;
  error: null;
}> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG_GET_ORDER_INFO);

  const order = await db.select().from(ordersSchema).where(eq(ordersSchema.orderNumber, orderNumber));

  return {
    success: true,
    order: order[0] ?? null,
    error: null,
  };
}

export async function getOrderByNumberAction(
  orderNumber: OrderTypes["orderNumber"],
): GetOrderResponseType {
  if (!orderNumber) {
    return { success: false, order: null, error: "Order number is required" };
  }

  try {
    return await getOrderByNumberCachedCore(orderNumber);
  } catch (error) {
    unstable_rethrow(error);
    return { error, success: false, order: null };
  }
}

export type GetOrderFullInfoByIdResponseType = Promise<{
  order: OrderTypes | null;
  orderItems: OrderItemsTypes[] | null;
  payments: OrderPaymentTypes | null;
  error: unknown;
}>;

async function getOrderFullInfoByIdCachedCore({
  id,
}: Pick<OrderTypes, "id">): Promise<{
  order: OrderTypes | null;
  orderItems: OrderItemsTypes[];
  payments: OrderPaymentTypes | null;
  error: null;
}> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.orders.byId(id));

  const [order] = await db.select().from(ordersSchema).where(eq(ordersSchema.id, id));
  const orderItems = await db.select().from(orderItemsSchema).where(eq(orderItemsSchema.orderId, id));
  const [payments] = await db.select().from(paymentsSchema).where(eq(paymentsSchema.orderId, id));

  return { order: order ?? null, orderItems, error: null, payments: payments ?? null };
}

export async function getOrderFullInfoById({
  id,
}: Pick<OrderTypes, "id">): GetOrderFullInfoByIdResponseType {
  if (!id) {
    return { error: "Order id is required", order: null, orderItems: null, payments: null };
  }

  try {
    return await getOrderFullInfoByIdCachedCore({ id });
  } catch (error) {
    unstable_rethrow(error);
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

async function getOrdersAllCachedCore(): Promise<OrderListItem[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAG_GET_ORDER_INFO);

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

  return orders.map((order) => {
    const itemsSubtotal = subtotalByOrderId.get(order.id) ?? 0;
    const delivery = order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : Number(order.deliveryPrice) || 0;

    return {
      ...order,
      itemsSubtotal,
      orderTotal: itemsSubtotal + delivery,
    };
  });
}

export async function getOrdersAllAction(): GetOrdersAllActionResponseType {
  if (isBuildPhase()) {
    return { orders: [], error: BUILD_PHASE_SKIP_ERROR };
  }

  try {
    const orders = await getOrdersAllCachedCore();
    return {
      orders,
      error: null,
    };
  } catch (error) {
    unstable_rethrow(error);
    return { error, orders: null };
  }
}
