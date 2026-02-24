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

export async function deleteOrderByOrderId({ id }: Pick<OrderTypes, "id">) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(paymentsSchema).where(eq(paymentsSchema.id, id));
      await tx.delete(ordersSchema).where(eq(ordersSchema.id, id));
      await tx.delete(orderItemsSchema).where(eq(orderItemsSchema.orderId, id));
    });
    updateTag(id);
    return { success: true };
  } catch (error) {
    return { error };
  }
}
