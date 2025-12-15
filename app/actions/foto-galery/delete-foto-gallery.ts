"use server";

import { db } from "@/db/db";
import { ProductType } from "@/db/schemas/product.schema";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { getFotoFromGallery } from "./get-foto-from-gallery";
import { deleteFileFromS3 } from "../files/uploadFile";
import { eq } from "drizzle-orm";

export async function deleteFotoGallery(product_id: ProductType["id"]) {
  try {
    const gallery = await getFotoFromGallery({
      parent_product_id: product_id,
    });

    const images: string[] = gallery.data?.images ?? [];

    await db.delete(productFotoGallery).where(eq(productFotoGallery.parent_product_id, product_id));

    if (images.length > 0) {
      const results = await Promise.allSettled(images.map((key) => deleteFileFromS3(key)));

      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length > 0) {
        console.error("[deleteFotoGallery] S3 delete errors:", failed);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteFotoGallery] fatal error:", error);
    return { success: false, error };
  }
}
