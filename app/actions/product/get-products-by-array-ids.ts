"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product.schema";
import { inArray } from "drizzle-orm";

export async function getProductsByIds(ids: string[]) {
  if (!ids || ids.length === 0) {
    return { data: [], error: "Please provide not empty array" };
  }

  try {
    const res = await db.select().from(productsSchema).where(inArray(productsSchema.id, ids));

    const availableProducts = res.filter((p) => p.inStock > 0);

    return {
      data: availableProducts,
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}
