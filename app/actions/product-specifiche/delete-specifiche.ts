"use server";

import { db } from "@/db/db";
import { productSpecificheSchema, ProductSpecificheType } from "@/db/schemas/product-specifiche";
import { eq } from "drizzle-orm";
import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";

export async function deleteSpecificheById(product_id: ProductSpecificheType["product_id"]) {
  try {
    await db
      .delete(productSpecificheSchema)
      .where(eq(productSpecificheSchema.product_id, product_id));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}

export async function deleteSpecificheImage(product_id: string, imageUrl: string) {
  try {
    await deleteFileFromS3(imageUrl);

    const existing = await db
      .select()
      .from(productSpecificheSchema)
      .where(eq(productSpecificheSchema.product_id, product_id));

    if (!existing.length) return { success: true };

    const updated = existing[0].images.filter((i) => i !== imageUrl);

    await db
      .update(productSpecificheSchema)
      .set({ images: updated })
      .where(eq(productSpecificheSchema.product_id, product_id));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
