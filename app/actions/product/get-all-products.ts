"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { isProductionBuild } from "@/utils/is-production-build";
import { withRetry } from "@/utils/with-retry";

export type ProductFetchResult = {
  success: boolean;
  data: ProductType[] | null;
  error: string | null;
};

async function getAllProductsCached(): Promise<ProductType[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.all);

  try {
    return await db.select().from(productsSchema);
  } catch (e) {
    console.error("[getAllProductsCached]", e);
    throw e;
  }
}

export async function getAllProducts(): Promise<ProductFetchResult> {
  try {
    const data = await withRetry(getAllProductsCached, {
      guard: isProductionBuild,
      onGuard: () => [],
    });
    return { success: true, data, error: null };
  } catch (e) {
    return {
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
