"use server";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db/db";
import { productReviewsSchema } from "@/db/schemas/product-reviews.schema";

type GetProductRatingResult =
  | {
      success: true;
      rating: string;
      count: number;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      rating: "0.0";
      count: 0;
      errorCode: "INVALID_INPUT" | "DB_ERROR";
      errorMessage: string;
    };

export async function getProductRating(productId: string): Promise<GetProductRatingResult> {
  if (!productId) {
    return {
      success: false,
      rating: "0.0",
      count: 0,
      errorCode: "INVALID_INPUT",
      errorMessage: "Product id is required",
    };
  }

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
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getProductRating]", error);
    return {
      success: false,
      rating: "0.0",
      count: 0,
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load product rating",
    };
  }
}
