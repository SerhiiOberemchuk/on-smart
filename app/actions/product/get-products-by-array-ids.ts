"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

type GetProductsByIdsResult = {
  success: boolean;
  data: typeof productsSchema.$inferSelect[] | null;
  errorCode: "INVALID_INPUT" | "DB_ERROR" | null;
  errorMessage: string | null;
};

export async function getProductsByIds(
  ids: string[],
  options?: {
    includeOutOfStock?: boolean;
  },
): Promise<GetProductsByIdsResult> {
  "use cache";
  const normalizedIds = Array.from(new Set(ids)).sort();

  if (!normalizedIds.length) {
    return {
      success: false,
      data: [],
      errorCode: "INVALID_INPUT",
      errorMessage: "Please provide not empty array",
    };
  }

  const includeOutOfStock = options?.includeOutOfStock ?? false;

  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.byIds(normalizedIds));
  cacheTag(CACHE_TAGS.product.all);

  try {
    const res = await db
      .select()
      .from(productsSchema)
      .where(and(inArray(productsSchema.id, normalizedIds), eq(productsSchema.isHidden, false)));

    const availableProducts = includeOutOfStock ? res : res.filter((p) => p.inStock > 0);

    return {
      success: true,
      data: availableProducts,
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getProductsByIds]", error);
    return {
      success: false,
      data: null,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load products by ids",
    };
  }
}
