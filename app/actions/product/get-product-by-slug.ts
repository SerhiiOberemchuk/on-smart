"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

type GetProductBySlugResult =
  | {
      success: true;
      data: ProductType | null;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      data: null;
      errorCode: "INVALID_INPUT" | "DB_ERROR";
      errorMessage: string;
    };

async function getProductBySlugCachedCore(
  slug: ProductType["slug"],
): Promise<GetProductBySlugResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.product.bySlug(slug));
  cacheTag(CACHE_TAGS.product.all);

  const [product] = await db
    .select()
    .from(productsSchema)
    .where(and(eq(productsSchema.slug, slug), eq(productsSchema.isHidden, false)));

  return {
    success: true,
    data: product ?? null,
    errorCode: null,
    errorMessage: null,
  };
}

export async function getProductBySlug(slug: ProductType["slug"]): Promise<GetProductBySlugResult> {
  if (!slug) {
    return {
      success: false,
      data: null,
      errorCode: "INVALID_INPUT",
      errorMessage: "Product slug is required",
    };
  }

  try {
    return await getProductBySlugCachedCore(slug);
  } catch (error) {
    console.error("[getProductBySlug]", error);
    return {
      success: false,
      data: null,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load product by slug",
    };
  }
}
