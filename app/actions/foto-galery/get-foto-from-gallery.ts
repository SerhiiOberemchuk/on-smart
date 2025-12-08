"use server";

import { db } from "@/db/db";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery";
import { eq } from "drizzle-orm";

export async function getFotoFromGallery(params: { parent_product_id: string }) {
  try {
    const response = await db
      .select()
      .from(productFotoGallery)
      .where(eq(productFotoGallery.parent_product_id, params.parent_product_id));

    if (!response.length) {
      return {
        success: false,
        data: null,
        error: "Gellery not exist!",
      };
    }

    return {
      success: true,
      data: response[0],
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
