"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import {
  orderItemsSchema,
  ordersSchema,
  OrderTypes,
  paymentsSchema,
} from "@/db/schemas/orders.schema";

import { requireAdminSession } from "../_shared/require-admin-session";
import { refreshAdminOrderCacheTags } from "./cache-tags";

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

export async function deleteOrderByOrderId({
  id,
}: Pick<OrderTypes, "id">): Promise<DeleteOrderResult> {
  await requireAdminSession();

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
    refreshAdminOrderCacheTags(id);
    return { success: true, errorCode: null, errorMessage: null };
  } catch (error) {
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: error instanceof Error ? error.message : "Failed to delete order",
    };
  }
}

export async function updateOrderInfoByOrderIDAction({
  orderId,
  dataToUpdate,
}: {
  orderId: OrderTypes["id"];
  dataToUpdate: Partial<Omit<OrderTypes, "id" | "updatedAt" | "createdAt">>;
}): Promise<OrderInfoUpdateResult> {
  await requireAdminSession();

  if (!orderId) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Order id is required",
    };
  }

  try {
    await db.update(ordersSchema).set(dataToUpdate).where(eq(ordersSchema.id, orderId));
    refreshAdminOrderCacheTags(orderId);
    return { success: true, errorCode: null, errorMessage: null };
  } catch (error) {
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}
