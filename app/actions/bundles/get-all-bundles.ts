"use server";

import { cacheLife, cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { unstable_rethrow } from "next/navigation";

import { db } from "@/db/db";
import { type BundleMetaType, bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export type BundleListItem = ProductType & {
  bundleMeta: BundleMetaType | null;
};

export type BundleFetchResult = {
  success: boolean;
  data: BundleListItem[] | null;
  error: string | null;
};

async function getAllBundlesCachedCore(): Promise<BundleFetchResult> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.bundle.all);

  const response = await db
    .select({
      bundle: productsSchema,
      bundleMeta: bundleMetaSchema,
    })
    .from(productsSchema)
    .leftJoin(bundleMetaSchema, eq(bundleMetaSchema.bundle_id, productsSchema.id))
    .where(eq(productsSchema.productType, "bundle"));

  return {
    success: true,
    data: response.map((row) => ({
      ...row.bundle,
      bundleMeta: row.bundleMeta,
    })),
    error: null,
  };
}

export async function getAllBundles(): Promise<BundleFetchResult> {
  try {
    return await getAllBundlesCachedCore();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[getAllBundles]", error);
    return {
      success: false,
      data: null,
      error: "Failed to load bundles",
    };
  }
}
