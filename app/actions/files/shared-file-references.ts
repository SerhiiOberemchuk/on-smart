"use server";

import { db } from "@/db/db";
import { bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { productDescriptionSchema } from "@/db/schemas/product-details.schema";
import { productDocumentsSchema } from "@/db/schemas/product-documents.schema";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { productSpecificheSchema } from "@/db/schemas/product-specifiche.schema";
import { ne } from "drizzle-orm";

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

export async function getSharedManagedFileReferences(excludeEntityId: string) {
  const referencedUrls = new Set<string>();

  const [
    otherProducts,
    otherGalleries,
    otherDescriptions,
    otherDocuments,
    otherSpecifiche,
    otherBundleMeta,
  ] = await Promise.all([
    db
      .select({ imgSrc: productsSchema.imgSrc })
      .from(productsSchema)
      .where(ne(productsSchema.id, excludeEntityId)),
    db
      .select({ images: productFotoGallery.images })
      .from(productFotoGallery)
      .where(ne(productFotoGallery.parent_product_id, excludeEntityId)),
    db
      .select({ images: productDescriptionSchema.images })
      .from(productDescriptionSchema)
      .where(ne(productDescriptionSchema.product_id, excludeEntityId)),
    db
      .select({ documents: productDocumentsSchema.documents })
      .from(productDocumentsSchema)
      .where(ne(productDocumentsSchema.product_id, excludeEntityId)),
    db
      .select({ images: productSpecificheSchema.images })
      .from(productSpecificheSchema)
      .where(ne(productSpecificheSchema.product_id, excludeEntityId)),
    db
      .select({ documents: bundleMetaSchema.documents })
      .from(bundleMetaSchema)
      .where(ne(bundleMetaSchema.bundle_id, excludeEntityId)),
  ]);

  for (const row of otherProducts) {
    const imageUrl = normalizePossibleJsonString(row.imgSrc);
    if (imageUrl) referencedUrls.add(imageUrl);
  }

  for (const row of otherGalleries) {
    for (const imageUrl of collectNonEmpty(row.images ?? [])) referencedUrls.add(imageUrl);
  }

  for (const row of otherDescriptions) {
    for (const imageUrl of collectNonEmpty(row.images ?? [])) referencedUrls.add(imageUrl);
  }

  for (const row of otherSpecifiche) {
    for (const imageUrl of collectNonEmpty(row.images ?? [])) referencedUrls.add(imageUrl);
  }

  for (const row of otherDocuments) {
    for (const document of row.documents ?? []) {
      const link = typeof document?.link === "string" ? document.link.trim() : "";
      if (link) referencedUrls.add(link);
    }
  }

  for (const row of otherBundleMeta) {
    for (const document of row.documents ?? []) {
      const link = typeof document?.link === "string" ? document.link.trim() : "";
      if (link) referencedUrls.add(link);
    }
  }

  return referencedUrls;
}
