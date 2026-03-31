"use server";

import { db } from "@/db/db";
import { bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { productsSchema, type ProductInsertType } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq, inArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import {
  buildCopyName,
  buildUniqueCopySlugWithResolver,
} from "./copy-bundle.helpers";

function normalizeNullableDecimal(
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeJsonStringValue(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === "string" ? parsed : trimmed;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

async function buildUniqueCopySlug(baseSlug: string): Promise<string> {
  return buildUniqueCopySlugWithResolver(baseSlug, async (candidate) => {
    const [existing] = await db
      .select({ id: productsSchema.id })
      .from(productsSchema)
      .where(eq(productsSchema.slug, candidate))
      .limit(1);

    return Boolean(existing);
  });
}

async function buildUniqueCopyNames(sourceName: string, sourceNameFull: string) {
  let counter = 1;

  while (counter < 1000) {
    const nameCandidate = buildCopyName(sourceName, counter);
    const nameFullCandidate = buildCopyName(sourceNameFull, counter);

    const [existing] = await db
      .select({ id: productsSchema.id })
      .from(productsSchema)
      .where(and(eq(productsSchema.name, nameCandidate), eq(productsSchema.nameFull, nameFullCandidate)))
      .limit(1);

    if (!existing) {
      return { name: nameCandidate, nameFull: nameFullCandidate };
    }

    counter += 1;
  }

  throw new Error("Unable to generate unique names for bundle copy");
}

export async function copyBundleById(sourceBundleId: string) {
  if (!sourceBundleId) {
    return { success: false, id: "", error: "Bundle id is required" };
  }

  try {
    const [sourceBundleRows, sourceBundleMetaRows, sourceGalleryRows] = await Promise.all([
      db
        .select()
        .from(productsSchema)
        .where(and(eq(productsSchema.id, sourceBundleId), eq(productsSchema.productType, "bundle")))
        .limit(1),
      db
        .select()
        .from(bundleMetaSchema)
        .where(eq(bundleMetaSchema.bundle_id, sourceBundleId))
        .limit(1),
      db
        .select()
        .from(productFotoGallery)
        .where(eq(productFotoGallery.parent_product_id, sourceBundleId))
        .limit(1),
    ]);
    const sourceBundle = sourceBundleRows[0];
    const sourceBundleMeta = sourceBundleMetaRows[0];
    const sourceGallery = sourceGalleryRows[0];

    if (!sourceBundle) {
      return { success: false, id: "", error: "Source bundle not found" };
    }

    const nextSlug = await buildUniqueCopySlug(sourceBundle.slug);
    const nextNames = await buildUniqueCopyNames(sourceBundle.name, sourceBundle.nameFull);

    const includedProductIds: string[] = Array.from(
      new Set(
        (sourceBundleMeta?.includedProducts ?? [])
          .map((item) => item.productId)
          .filter((item): item is string => typeof item === "string" && item.length > 0),
      ),
    );

    const includedProducts =
      includedProductIds.length > 0
        ? await db
            .select({ id: productsSchema.id, bundleIds: productsSchema.bundleIds })
            .from(productsSchema)
            .where(and(inArray(productsSchema.id, includedProductIds), eq(productsSchema.productType, "product")))
        : [];

    if (includedProducts.length !== includedProductIds.length) {
      return { success: false, id: "", error: "Some bundled products were not found" };
    }

    const { id: _sourceId, ...sourceBundleWithoutId } = sourceBundle;

    const payload: ProductInsertType = {
      ...sourceBundleWithoutId,
      slug: nextSlug,
      name: nextNames.name,
      nameFull: nextNames.nameFull,
      imgSrc: normalizeJsonStringValue(sourceBundle.imgSrc),
      oldPrice: normalizeNullableDecimal(sourceBundle.oldPrice),
      rating: normalizeNullableDecimal(sourceBundle.rating) ?? "5.0",
      relatedProductIds: [],
      bundleIds: [],
    };

    const copiedBundleId = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(productsSchema).values(payload).$returningId();
      const newBundleId = inserted?.id;

      if (!newBundleId) {
        throw new Error("Failed to copy bundle");
      }

      for (const product of includedProducts) {
        const nextBundleIds = Array.from(new Set([...(product.bundleIds ?? []), newBundleId]));
        await tx
          .update(productsSchema)
          .set({ bundleIds: nextBundleIds })
          .where(eq(productsSchema.id, product.id));
      }

      if (sourceBundleMeta) {
        await tx.insert(bundleMetaSchema).values({
          bundle_id: newBundleId,
          includedProducts: sourceBundleMeta.includedProducts,
          advantages: sourceBundleMeta.advantages,
          description: sourceBundleMeta.description,
          documents: sourceBundleMeta.documents,
          reviews: [],
        });
      }

      if (sourceGallery) {
        await tx.insert(productFotoGallery).values({
          parent_product_id: newBundleId,
          images: sourceGallery.images,
        });
      }

      return newBundleId;
    });

    updateTag(CACHE_TAGS.bundle.all);
    updateTag(CACHE_TAGS.bundle.byId(copiedBundleId));
    updateTag(CACHE_TAGS.bundle.bySlug(nextSlug));
    updateTag(CACHE_TAGS.bundleMeta.byBundleId(copiedBundleId));
    updateTag(CACHE_TAGS.gallery.byParentProductId(copiedBundleId));
    updateTag(CACHE_TAGS.product.all);

    return { success: true, id: copiedBundleId, error: null };
  } catch (error) {
    return {
      success: false,
      id: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
