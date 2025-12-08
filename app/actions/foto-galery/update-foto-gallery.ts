"use server";

import { db } from "@/db/db";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery";
import { eq } from "drizzle-orm";

export async function updateFotoGallery(params: { parent_product_id: string; images: string[] }) {
  try {
    const isGallery = await db
      .select()
      .from(productFotoGallery)
      .where(eq(productFotoGallery.parent_product_id, params.parent_product_id));
    if (isGallery.length > 0) {
      const updateResponse = await db
        .update(productFotoGallery)
        .set({ images: params.images })
        .where(eq(productFotoGallery.parent_product_id, params.parent_product_id));
      console.log({ updateResponse });

      return {
        success: true,
        error: null,
      };
    }
    const createResponse = await db.insert(productFotoGallery).values(params);
    console.log({ createResponse });
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return { success: false, error };
  }
}
