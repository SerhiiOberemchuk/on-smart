"use server";

import { db } from "@/db/db";
import {
  productSpecificheSchema,
  ProductSpecificheType,
} from "@/db/schemas/product-specifiche.schema";
import { eq } from "drizzle-orm";
import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";
import { getProductSpecificheById } from "./get-product-specifiche";

export async function deleteProductSpecificheById(product_id: ProductSpecificheType["product_id"]) {
  try {
    const specifiche = await getProductSpecificheById(product_id);
    await db
      .delete(productSpecificheSchema)
      .where(eq(productSpecificheSchema.product_id, product_id));

    if (specifiche.data?.images.length) {
      const res = await Promise.allSettled(specifiche.data.images.map((i) => deleteFileFromS3(i)));
      const faile = res.filter((i) => i.status === "rejected");
      console.error("[deleteSpecificheById] faile to delete S3", faile);
      return { succes: true, faile };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}

export async function deleteProductSpecificheImage(product_id: string, imageUrl: string) {
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
