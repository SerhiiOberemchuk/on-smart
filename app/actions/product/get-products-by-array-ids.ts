"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product-schema";

export async function getProductsByIds(ids: string[]) {
  try {
    const res = await db.select().from(productsSchema);
    return { data: res, error: null };
  } catch (error) {
    return { error, data: null };
  }
}
