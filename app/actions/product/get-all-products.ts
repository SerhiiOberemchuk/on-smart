"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { eq } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export type ProductFetchResult = {
  success: boolean;
  data: ProductType[] | null;
  error: string | null;
};

export async function getAllProducts(options?: { includeHidden?: boolean }) {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.all);

  try {
    const includeHidden = options?.includeHidden ?? false;
    const response = includeHidden
      ? await db.select().from(productsSchema)
      : await db.select().from(productsSchema).where(eq(productsSchema.isHidden, false));

    return { success: true, data: response, error: null };
  } catch (error) {
    console.error("DB error:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
