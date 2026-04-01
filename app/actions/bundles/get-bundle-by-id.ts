"use server";

import { cacheLife, cacheTag } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/db";
import { type BundleMetaType, bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { type ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export type BundleByIdType = {
  bundle: ProductType;
  bundleMeta: BundleMetaType | null;
};

export type BundleByIdResult = {
  success: boolean;
  data: BundleByIdType | null;
  error: string | null;
};

class BundleByIdNotFoundError extends Error {
  constructor() {
    super("Bundle not found");
    this.name = "BundleByIdNotFoundError";
  }
}

async function getBundleByIdCachedCore(id: ProductType["id"]): Promise<BundleByIdResult> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.bundle.all);
  cacheTag(CACHE_TAGS.bundle.byId(id));
  cacheTag(CACHE_TAGS.bundleMeta.byBundleId(id));

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
    throw new BundleByIdNotFoundError();
  }

  return {
    success: true,
    data: {
      bundle: row.bundle,
      bundleMeta: row.bundleMeta,
    },
    error: null,
  };
}

export async function getBundleById(id: ProductType["id"]): Promise<BundleByIdResult> {
  if (!id) {
    return {
      success: false,
      data: null,
      error: "Bundle id is required",
    };
  }

  try {
    return await getBundleByIdCachedCore(id);
  } catch (error) {
    if (error instanceof BundleByIdNotFoundError) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    console.error("[getBundleById]", error);
    return {
      success: false,
      data: null,
      error: "Failed to load bundle by id",
    };
  }
}
