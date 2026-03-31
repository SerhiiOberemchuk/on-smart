"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getProductBySlug(slug: ProductType["slug"]) {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.product.bySlug(slug));
  cacheTag(CACHE_TAGS.product.all);

  if (!slug) {
    return {
      success: false,
      data: null,
      error: "Product slug is required",
    };
  }

  try {
    const [product] = await db
      .select()
      .from(productsSchema)
      .where(and(eq(productsSchema.slug, slug), eq(productsSchema.isHidden, false)));

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
