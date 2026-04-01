"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export type ProductFetchResult =
  | {
      success: true;
      data: ProductType[];
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data: null;
      errorCode: "DB_ERROR";
      errorMessage: string;
    };

export async function getAllProducts(
  options?: { includeHidden?: boolean },
): Promise<ProductFetchResult> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.all);
  const includeHidden = options?.includeHidden ?? false;

  try {
    const response = includeHidden
      ? await db.select().from(productsSchema)
      : await db.select().from(productsSchema).where(eq(productsSchema.isHidden, false));

    return {
      success: true,
      data: response,
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getAllProducts]", error);
    return {
      success: false,
      data: null,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load products",
    };
  }
}
