"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { eq } from "drizzle-orm";

import { deleteFotoGallery } from "../foto-galery/delete-foto-gallery";
import { deleteProductDescriptionById } from "../product-details.ts/delete-product-description";
import { deleteProductDocuments } from "../product-documents/delete-product-documents";
import { deleteFileFromS3 } from "../files/uploadFile";
import { updateTag } from "next/cache";
import { deleteProductSpecificheById } from "../product-specifiche/delete-product-specifiche";

export async function deleteProductById(id: ProductType["id"]) {
  if (!id) {
    return { success: false, error: "Id required" };
  }

  try {
    const product = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.id, id))
      .limit(1);

    if (!product.length) {
      return {
        success: false,
        error: "Product not found",
      };
    }
    console.log(product);

    if (product[0].hasVariants) {
      return {
        success: false,
        error: "Product has variants",
      };
    }

    await db.delete(productsSchema).where(eq(productsSchema.id, id));

    await deleteFotoGallery(id);
    await deleteProductDescriptionById({ id });
    await deleteProductDocuments(id);
    await deleteProductSpecificheById(id);

    if (product[0].imgSrc) {
      await deleteFileFromS3(product[0].imgSrc);
    }

    updateTag("get_all_product");

    return { success: true };
  } catch (error) {
    console.error("[deleteProductById]", error);
    return { success: false, error };
  }
}
