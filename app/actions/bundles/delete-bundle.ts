"use server";

import { deleteFileFromS3 } from "@/app/actions/files/uploadFile";
import { db } from "@/db/db";
import { bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function deleteBundleById(bundleId: string) {
  if (!bundleId) {
    return { success: false, error: "Bundle id is required" };
  }

  try {
    const bundle = await db
      .select({
        id: productsSchema.id,
        slug: productsSchema.slug,
        imgSrc: productsSchema.imgSrc,
      })
      .from(productsSchema)
      .where(and(eq(productsSchema.id, bundleId), eq(productsSchema.productType, "bundle")))
      .limit(1);

    if (!bundle[0]) {
      return { success: false, error: "Bundle not found" };
    }

    const gallery = await db
      .select({ images: productFotoGallery.images })
      .from(productFotoGallery)
      .where(eq(productFotoGallery.parent_product_id, bundleId))
      .limit(1);

    const productsWithBundle = await db
      .select({
        id: productsSchema.id,
        bundleIds: productsSchema.bundleIds,
      })
      .from(productsSchema)
      .where(eq(productsSchema.productType, "product"));

    await db.transaction(async (tx) => {
      for (const product of productsWithBundle) {
        const currentBundleIds = product.bundleIds ?? [];
        if (!currentBundleIds.includes(bundleId)) continue;

        const nextBundleIds = currentBundleIds.filter((id) => id !== bundleId);
        await tx
          .update(productsSchema)
          .set({ bundleIds: nextBundleIds })
          .where(eq(productsSchema.id, product.id));
      }

      await tx.delete(bundleMetaSchema).where(eq(bundleMetaSchema.bundle_id, bundleId));
      await tx.delete(productFotoGallery).where(eq(productFotoGallery.parent_product_id, bundleId));
      await tx.delete(productsSchema).where(eq(productsSchema.id, bundleId));
    });

    const fileUrls = [bundle[0].imgSrc, ...(gallery[0]?.images ?? [])].filter(
      (url): url is string => typeof url === "string" && url.length > 0,
    );

    await Promise.allSettled(fileUrls.map((url) => deleteFileFromS3(url)));

    updateTag(CACHE_TAGS.bundle.all);
    updateTag(CACHE_TAGS.bundle.byId(bundleId));
    updateTag(CACHE_TAGS.bundle.bySlug(bundle[0].slug));
    updateTag(CACHE_TAGS.bundleMeta.byBundleId(bundleId));
    updateTag(CACHE_TAGS.gallery.byParentProductId(bundleId));
    updateTag(CACHE_TAGS.product.all);

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
