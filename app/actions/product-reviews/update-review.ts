"use server";

import { db } from "@/db/db";
import { productReviewsSchema, ProductReviewType } from "@/db/schemas/product-reviews.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export async function updateProductReviewById(
  data: Pick<ProductReviewType, "id" | "is_approved" | "product_id">,
) {
  try {
    await db
      .update(productReviewsSchema)
      .set({ is_approved: data.is_approved })
      .where(eq(productReviewsSchema.id, data.id));
    updateTag(CACHE_TAGS.product.reviewsById(data.product_id));
    return { success: true };
  } catch (error) {
    return {
      error,
      success: false,
    };
  }
}
