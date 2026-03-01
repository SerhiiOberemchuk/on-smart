"use server";

import { db } from "@/db/db";
import { type BundleMetaType, bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { type ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export type BundleByIdType = {
  bundle: ProductType;
  bundleMeta: BundleMetaType | null;
};

export type BundleByIdResult = {
  success: boolean;
  data: BundleByIdType | null;
  error: string | null;
};

export async function getBundleById(id: ProductType["id"]): Promise<BundleByIdResult> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.bundle.all);
  cacheTag(CACHE_TAGS.bundle.byId(id));
  cacheTag(CACHE_TAGS.bundleMeta.byBundleId(id));

  try {
    const rows = await db
      .select({
        bundle: productsSchema,
        bundleMeta: bundleMetaSchema,
      })
      .from(productsSchema)
      .leftJoin(bundleMetaSchema, eq(bundleMetaSchema.bundle_id, productsSchema.id))
      .where(and(eq(productsSchema.id, id), eq(productsSchema.productType, "bundle")));

    const row = rows[0] ?? null;

    if (!row?.bundle) {
      return { success: false, data: null, error: "Bundle not found" };
    }

    return {
      success: true,
      data: {
        bundle: row.bundle,
        bundleMeta: row.bundleMeta,
      },
      error: null,
    };
  } catch (error) {
    console.error("[getBundleById]", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
