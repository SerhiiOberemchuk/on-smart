"use server";

import { db } from "@/db/db";
import { ordersSchema, OrderTypes } from "@/db/schemas/orders.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";

export async function updateOrderInfoByOrderIDAction({
  orderId,
  dataToUpdate,
}: {
  orderId: OrderTypes["id"];
  dataToUpdate: Partial<Omit<OrderTypes, "id" | "updatedAt" | "createdAt">>;
}) {
  try {
    await db.update(ordersSchema).set(dataToUpdate).where(eq(ordersSchema.id, orderId));
    updateTag(CACHE_TAG_GET_ORDER_INFO);
    updateTag(orderId);
    return { succes: true };
  } catch (error) {
    return { error };
  }
}
