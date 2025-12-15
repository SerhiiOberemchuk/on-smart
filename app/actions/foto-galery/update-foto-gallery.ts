"use server";

import { db } from "@/db/db";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function updateFotoGallery(params: { parent_product_id: string; images: string[] }) {
  updateTag(params.parent_product_id);
  try {
    const isGallery = await db
      .select()
      .from(productFotoGallery)
      .where(eq(productFotoGallery.parent_product_id, params.parent_product_id));
    if (isGallery.length > 0) {
      await db
        .update(productFotoGallery)
        .set({ images: params.images })
        .where(eq(productFotoGallery.parent_product_id, params.parent_product_id));

      return {
        success: true,
        error: null,
      };
    }
    await db.insert(productFotoGallery).values(params);
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return { success: false, error };
  }
}
