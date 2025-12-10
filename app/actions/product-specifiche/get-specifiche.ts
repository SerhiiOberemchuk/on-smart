"use server";

import { db } from "@/db/db";
import { productSpecificheSchema, ProductSpecificheType } from "@/db/schemas/product-specifiche";
import { eq } from "drizzle-orm";

export async function getSpecificheById(product_id: ProductSpecificheType["product_id"]) {
  try {
    const res = await db
      .select()
      .from(productSpecificheSchema)
      .where(eq(productSpecificheSchema.product_id, product_id));

    if (res.length === 0) return { success: true, data: null };

    return { success: true, data: res[0] };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
