"use server";

import { db } from "@/db/db";
import { productReviewsSchema } from "@/db/schemas/product-reviews.schema";
import { ProductType } from "@/db/schemas/product.schema";
import { eq, desc, and } from "drizzle-orm";
import { cacheTag } from "next/cache";

export async function getProductReviews(productId: ProductType["id"]) {
  "use cache";
  cacheTag("product_review_" + productId);
  try {
    const reviews = await db
      .select()
      .from(productReviewsSchema)
      .where(
        and(
          eq(productReviewsSchema.product_id, productId),
          eq(productReviewsSchema.is_approved, true),
        ),
      )
      .orderBy(desc(productReviewsSchema.created_at));
    return { reviews, success: true };
  } catch (error) {
    return { success: false, error };
  }
}
export async function getProductReviewsAdmin(productId: ProductType["id"]) {
  "use cache";
  cacheTag("product_review_" + productId);
  try {
    const reviews = await db
      .select()
      .from(productReviewsSchema)
      .where(and(eq(productReviewsSchema.product_id, productId)))
      .orderBy(desc(productReviewsSchema.created_at));
    return { reviews, success: true };
  } catch (error) {
    return { success: false, error };
  }
}
