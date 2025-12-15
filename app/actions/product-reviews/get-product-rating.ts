"use server";

import { db } from "@/db/db";
import { productReviewsSchema } from "@/db/schemas/product-reviews.schema";
import { and, eq, sql } from "drizzle-orm";

export async function getProductRating(productId: string) {
  try {
    const result = await db
      .select({
        avg: sql<number>`AVG(${productReviewsSchema.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(productReviewsSchema)
      .where(
        and(
          eq(productReviewsSchema.product_id, productId),
          eq(productReviewsSchema.is_approved, true),
        ),
      );

    return {
      success: true,
      rating: Number(result[0]?.avg ?? 0).toFixed(1),
      count: result[0]?.count ?? 0,
    };
  } catch (error) {
    return { error, success: false };
  }
}
