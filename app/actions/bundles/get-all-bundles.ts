"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";

export type BundleFetchResult = {
  success: boolean;
  data: ProductType[] | null;
  error: string | null;
};

export async function getAllBundles(): Promise<BundleFetchResult> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.bundle.all);

  try {
    const response = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.productType, "bundle"));
    return { success: true, data: response, error: null };
  } catch (error) {
    console.error("[getAllBundles]", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
