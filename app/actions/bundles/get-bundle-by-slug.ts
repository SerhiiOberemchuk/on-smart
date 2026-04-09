"use server";

import { cacheLife, cacheTag } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { type BundleMetaType, bundleMetaSchema } from "@/db/schemas/bundle-meta.schema";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { productsSchema, type ProductType } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export type BundleBySlugType = ProductType & {
  category_name: string;
  brand_name: string;
  brand_image: string | null;
  bundleMeta: BundleMetaType | null;
};

export type BundleBySlugResult = {
  success: boolean;
  data: BundleBySlugType | null;
  error: string | null;
};

class BundleBySlugNotFoundError extends Error {
  constructor() {
    super("Bundle not found");
    this.name = "BundleBySlugNotFoundError";
  }
}

export async function getBundleBySlug(slug: ProductType["slug"]): Promise<BundleBySlugResult> {
  "use cache";

  if (!slug) {
    return { success: false, data: null, error: "Bundle slug is required" };
  }
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.bundle.all);
  cacheTag(CACHE_TAGS.bundle.bySlug(slug));

  try {
    const rows = await db
      .select({
        bundle: productsSchema,
        bundleMeta: bundleMetaSchema,
        category_name: categoryProductsSchema.name,
        brand_name: brandProductsSchema.name,
        brand_image: brandProductsSchema.image,
      })
      .from(productsSchema)
      .leftJoin(categoryProductsSchema, eq(productsSchema.category_id, categoryProductsSchema.id))
      .leftJoin(brandProductsSchema, eq(productsSchema.brand_slug, brandProductsSchema.brand_slug))
      .leftJoin(bundleMetaSchema, eq(bundleMetaSchema.bundle_id, productsSchema.id))
      .where(
        and(
          eq(productsSchema.slug, slug),
          eq(productsSchema.productType, "bundle"),
          eq(productsSchema.isHidden, false),
        ),
      )
      .limit(1);

    const row = rows[0] ?? null;

    if (!row) {
      throw new BundleBySlugNotFoundError();
    }

    cacheTag(CACHE_TAGS.bundleMeta.byBundleId(row.bundle.id));

    return {
      success: true,
      data: {
        ...row.bundle,
        bundleMeta: row.bundleMeta,
        category_name: row.category_name ?? row.bundle.category_slug,
        brand_name: row.brand_name ?? row.bundle.brand_slug,
        brand_image: row.brand_image ?? null,
      },
      error: null,
    };
  } catch (error) {
    if (error instanceof BundleBySlugNotFoundError) {
      return { success: false, data: null, error: error.message };
    }

    console.error("[getBundleBySlug]", error);
    return {
      success: false,
      data: null,
      error: "Failed to load bundle by slug",
    };
  }
}
