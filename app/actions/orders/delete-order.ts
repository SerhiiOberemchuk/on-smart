"use server";

import { db } from "@/db/db";
import {
  orderItemsSchema,
  ordersSchema,
  OrderTypes,
  paymentsSchema,
} from "@/db/schemas/orders.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";

export type DeleteOrderResult =
  | {
      success: true;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      errorCode: "INVALID_INPUT" | "DB_ERROR";
      errorMessage: string;
    };

export async function deleteOrderByOrderId({
  id,
}: Pick<OrderTypes, "id">): Promise<DeleteOrderResult> {
  if (!id) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Order id is required",
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(orderItemsSchema).where(eq(orderItemsSchema.orderId, id));
      await tx.delete(paymentsSchema).where(eq(paymentsSchema.orderId, id));
      await tx.delete(ordersSchema).where(eq(ordersSchema.id, id));
    });
    updateTag(CACHE_TAG_GET_ORDER_INFO);
    updateTag(CACHE_TAGS.orders.byId(id));
    updateTag(CACHE_TAGS.product.topSales);
    return { success: true, errorCode: null, errorMessage: null };
  } catch (error) {
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: error instanceof Error ? error.message : "Failed to delete order",
    };
  }
}
