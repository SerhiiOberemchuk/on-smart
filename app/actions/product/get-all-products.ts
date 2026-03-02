"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

type Props = {
  page?: number;
  limit?: number;
  brand_slug?: string;
  category?: string;
};
export type ProductFetchResult = {
  success: boolean;
  data: ProductType[] | null;
  error: string | null;
};

export async function getAllProducts() {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.all);

  try {
    const response = await db.select().from(productsSchema);
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
