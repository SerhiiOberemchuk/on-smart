"use server";

import { db } from "@/db/db";
import { ordersSchema, OrderTypes } from "@/db/schemas/orders.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export type OrderInfoUpdateResult =
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

export async function updateOrderInfoByOrderIDAction({
  orderId,
  dataToUpdate,
}: {
  orderId: OrderTypes["id"];
  dataToUpdate: Partial<Omit<OrderTypes, "id" | "updatedAt" | "createdAt">>;
}): Promise<OrderInfoUpdateResult> {
  if (!orderId) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Order id is required",
    };
  }

  try {
    await db.update(ordersSchema).set(dataToUpdate).where(eq(ordersSchema.id, orderId));
    updateTag(CACHE_TAG_GET_ORDER_INFO);
    updateTag(CACHE_TAGS.orders.byId(orderId));
    updateTag(CACHE_TAGS.product.topSales);
    return { success: true, errorCode: null, errorMessage: null };
  } catch (error) {
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}
