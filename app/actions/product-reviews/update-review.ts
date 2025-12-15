"use server";

import { db } from "@/db/db";
import { productReviewsSchema, ProductReviewType } from "@/db/schemas/product-reviews.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function updateProductReviewById(
  data: Pick<ProductReviewType, "id" | "is_approved" | "product_id">,
) {
  try {
    await db
      .update(productReviewsSchema)
      .set({ is_approved: data.is_approved })
      .where(eq(productReviewsSchema.id, data.id));
    updateTag("product_review_" + data.product_id);
    return { success: true };
  } catch (error) {
    return {
      error,
      success: false,
    };
  }
}
