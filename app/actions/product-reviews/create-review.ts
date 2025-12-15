"use server";

import { db } from "@/db/db";
import { productReviewsSchema } from "@/db/schemas/product-reviews.schema";
import { updateTag } from "next/cache";

export async function createProductReview(prevState: { success: boolean }, data: FormData) {
  const product_id = String(data.get("productId"));
  const client_name = String(data.get("nome"));
  const email = String(data.get("email"));
  const rating = Number(data.get("rating"));
  const comment = String(data.get("messaggio"));
  try {
    await db.insert(productReviewsSchema).values({
      product_id,
      client_name,
      email,
      rating,
      comment,
      is_approved: false,
    });
    updateTag("product_review_" + product_id);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
