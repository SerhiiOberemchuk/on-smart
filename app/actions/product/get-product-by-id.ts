"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getProductById(id: ProductType["id"]) {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.byId(id));
  cacheTag(CACHE_TAGS.product.all);

  if (!id) {
    return {
      success: false,
      data: null,
      error: "Product id is required",
    };
  }

  try {
    const rows = await db.select().from(productsSchema).where(eq(productsSchema.id, id));

    const product = rows[0] ?? null;

    if (!product) {
      return {
        success: false,
        data: null,
        error: "Товар не знайдено",
      };
    }

    return {
      success: true,
      data: product,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error,
    };
  }
}
