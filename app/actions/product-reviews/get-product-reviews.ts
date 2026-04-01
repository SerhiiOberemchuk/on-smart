"use server";

import { db } from "@/db/db";
import { productReviewsSchema } from "@/db/schemas/product-reviews.schema";
import { ProductType } from "@/db/schemas/product.schema";
import { eq, desc, and } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

type ProductReviewsResult = {
  reviews?: typeof productReviewsSchema.$inferSelect[];
  success: boolean;
  errorCode: "INVALID_INPUT" | "DB_ERROR" | null;
  errorMessage: string | null;
};

export async function getProductReviews(productId: ProductType["id"]): Promise<ProductReviewsResult> {
  "use cache";

  if (!productId) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Product id is required",
    };
  }

  cacheTag(CACHE_TAGS.product.reviewsById(productId));

  try {
    const reviews = await db
      .select()
      .from(productReviewsSchema)
      .where(
        and(eq(productReviewsSchema.product_id, productId), eq(productReviewsSchema.is_approved, true)),
      )
      .orderBy(desc(productReviewsSchema.created_at));

    return { reviews, success: true, errorCode: null, errorMessage: null };
  } catch (error) {
    console.error("[getProductReviews]", error);
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load product reviews",
    };
  }
}

export async function getProductReviewsAdmin(
  productId: ProductType["id"],
): Promise<ProductReviewsResult> {
  "use cache";

  if (!productId) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Product id is required",
    };
  }

  cacheTag(CACHE_TAGS.product.reviewsById(productId));

  try {
    const reviews = await db
      .select()
      .from(productReviewsSchema)
      .where(and(eq(productReviewsSchema.product_id, productId)))
      .orderBy(desc(productReviewsSchema.created_at));

    return { reviews, success: true, errorCode: null, errorMessage: null };
  } catch (error) {
    console.error("[getProductReviewsAdmin]", error);
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load admin product reviews",
    };
  }
}
