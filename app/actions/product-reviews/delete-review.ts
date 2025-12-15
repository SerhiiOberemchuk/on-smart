"use server";

import { db } from "@/db/db";
import { productReviewsSchema, ProductReviewType } from "@/db/schemas/product-reviews.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function deleteProductReviewById(data: Pick<ProductReviewType, "id" | "product_id">) {
  try {
    await db.delete(productReviewsSchema).where(eq(productReviewsSchema.id, data.id));
    updateTag("product_review_" + data.product_id);
    return { success: true };
  } catch (error) {
    return {
      error,
      success: false,
    };
  }
}
