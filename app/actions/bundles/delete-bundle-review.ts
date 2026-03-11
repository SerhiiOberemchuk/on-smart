"use server";

import { db } from "@/db/db";
import { bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function deleteBundleReview({
  bundleId,
  reviewId,
}: {
  bundleId: string;
  reviewId: string;
}) {
  if (!bundleId || !reviewId) {
    return { success: false, error: "Missing bundleId or reviewId" };
  }

  try {
    const [bundle] = await db
      .select({
        id: productsSchema.id,
        slug: productsSchema.slug,
      })
      .from(productsSchema)
      .where(and(eq(productsSchema.id, bundleId), eq(productsSchema.productType, "bundle")))
      .limit(1);

    if (!bundle) {
      return { success: false, error: "Bundle not found" };
    }

    const [bundleMeta] = await db
      .select({
        reviews: bundleMetaSchema.reviews,
      })
      .from(bundleMetaSchema)
      .where(eq(bundleMetaSchema.bundle_id, bundleId))
      .limit(1);

    const nextReviews = (bundleMeta?.reviews ?? []).filter((item) => item.id !== reviewId);

    await db
      .insert(bundleMetaSchema)
      .values({
        bundle_id: bundleId,
        reviews: nextReviews,
      })
      .onDuplicateKeyUpdate({
        set: {
          reviews: nextReviews,
        },
      });

    updateTag(CACHE_TAGS.bundle.byId(bundleId));
    updateTag(CACHE_TAGS.bundle.bySlug(bundle.slug));
    updateTag(CACHE_TAGS.bundleMeta.byBundleId(bundleId));

    return { success: true, error: null };
  } catch (error) {
    console.error("[deleteBundleReview]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
