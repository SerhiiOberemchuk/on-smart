"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getProductsByIds(
  ids: string[],
  options?: {
    includeOutOfStock?: boolean;
  },
) {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.byIds(ids));
  cacheTag(CACHE_TAGS.product.all);
  if (!ids || ids.length === 0) {
    return { data: [], error: "Please provide not empty array" };
  }

  try {
    const res = await db.select().from(productsSchema).where(inArray(productsSchema.id, ids));

    const availableProducts = options?.includeOutOfStock ? res : res.filter((p) => p.inStock > 0);

    return {
      data: availableProducts,
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}
