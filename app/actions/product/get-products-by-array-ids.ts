"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getProductsByIds(
  ids: string[],
  options?: {
    includeOutOfStock?: boolean;
  },
) {
  "use cache";

  const normalizedIds = Array.from(new Set(ids)).sort();
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.byIds(normalizedIds));
  cacheTag(CACHE_TAGS.product.all);
  if (!normalizedIds.length) {
    return { data: [], error: "Please provide not empty array" };
  }

  try {
    const res = await db
      .select()
      .from(productsSchema)
      .where(and(inArray(productsSchema.id, normalizedIds), eq(productsSchema.isHidden, false)));

    const availableProducts = options?.includeOutOfStock ? res : res.filter((p) => p.inStock > 0);

    return {
      data: availableProducts,
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}
