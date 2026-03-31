"use server";

import { db } from "@/db/db";
import { productDescriptionSchema } from "@/db/schemas/product-details.schema";
import { productDocumentsSchema } from "@/db/schemas/product-documents.schema";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { productCharacteristicProductSchema } from "@/db/schemas/product_characteristic_product.schema";
import { productReviewsSchema } from "@/db/schemas/product-reviews.schema";
import { productSpecificheSchema } from "@/db/schemas/product-specifiche.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";

import { deleteFileFromS3 } from "../files/uploadFile";
import { updateTag } from "next/cache";

function normalizePossibleJsonString(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === "string" ? parsed.trim() : trimmed;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function collectNonEmpty(values: Array<string | null | undefined>): string[] {
  return values.map((value) => (typeof value === "string" ? value.trim() : "")).filter(Boolean);
}

export async function deleteProductById(id: ProductType["id"]) {
  if (!id) {
    return { success: false, error: "Id required" };
  }

  try {
    const [product] = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.id, id))
      .limit(1);

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    if (product.hasVariants) {
      return {
        success: false,
        error: "Product has variants",
      };
    }

    const filesToDelete = new Set<string>();
    filesToDelete.add(normalizePossibleJsonString(product.imgSrc));

    await db.transaction(async (tx) => {
      const [galleryRows, descriptionRows, documentsRows, specificheRows] = await Promise.all([
        tx
          .select({ images: productFotoGallery.images })
          .from(productFotoGallery)
          .where(eq(productFotoGallery.parent_product_id, id))
          .limit(1),
        tx
          .select({ images: productDescriptionSchema.images })
          .from(productDescriptionSchema)
          .where(eq(productDescriptionSchema.product_id, id))
          .limit(1),
        tx
          .select({ documents: productDocumentsSchema.documents })
          .from(productDocumentsSchema)
          .where(eq(productDocumentsSchema.product_id, id))
          .limit(1),
        tx
          .select({ images: productSpecificheSchema.images })
          .from(productSpecificheSchema)
          .where(eq(productSpecificheSchema.product_id, id))
          .limit(1),
      ]);
      const galleryRow = galleryRows[0];
      const descriptionRow = descriptionRows[0];
      const documentsRow = documentsRows[0];
      const specificheRow = specificheRows[0];

      for (const imageUrl of collectNonEmpty(galleryRow?.images ?? [])) filesToDelete.add(imageUrl);
      for (const imageUrl of collectNonEmpty(descriptionRow?.images ?? [])) filesToDelete.add(imageUrl);
      for (const imageUrl of collectNonEmpty(specificheRow?.images ?? [])) filesToDelete.add(imageUrl);
      for (const doc of documentsRow?.documents ?? []) {
        const link = typeof doc?.link === "string" ? doc.link.trim() : "";
        if (link) filesToDelete.add(link);
      }

      await tx.delete(productsSchema).where(eq(productsSchema.id, id));
      await tx
        .delete(productCharacteristicProductSchema)
        .where(eq(productCharacteristicProductSchema.product_id, id));
      await tx
        .delete(productReviewsSchema)
        .where(eq(productReviewsSchema.product_id, id));
      await tx.delete(productFotoGallery).where(eq(productFotoGallery.parent_product_id, id));
      await tx
        .delete(productDescriptionSchema)
        .where(eq(productDescriptionSchema.product_id, id));
      await tx
        .delete(productDocumentsSchema)
        .where(eq(productDocumentsSchema.product_id, id));
      await tx
        .delete(productSpecificheSchema)
        .where(eq(productSpecificheSchema.product_id, id));
    });

    if (filesToDelete.size > 0) {
      const cleanupResults = await Promise.allSettled(
        Array.from(filesToDelete).map((fileUrl) => deleteFileFromS3(fileUrl)),
      );
      const rejected = cleanupResults.filter((item) => item.status === "rejected");
      if (rejected.length > 0) {
        console.error("[deleteProductById] S3 cleanup rejected:", rejected);
      }
    }

    updateTag(CACHE_TAGS.product.all);
    updateTag(CACHE_TAGS.product.byId(id));
    updateTag(CACHE_TAGS.product.bySlug(product.slug));
    updateTag(CACHE_TAGS.product.supportById(id));
    updateTag(CACHE_TAGS.product.details.byId(id));
    updateTag(CACHE_TAGS.product.details.all);
    updateTag(CACHE_TAGS.product.reviewsById(id));
    updateTag(CACHE_TAGS.gallery.byParentProductId(id));

    return { success: true };
  } catch (error) {
    console.error("[deleteProductById]", error);
    return { success: false, error };
  }
}
