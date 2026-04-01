"use server";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { BrandTypes } from "@/types/brands.types";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

import { eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";

const BRAND_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;

type BrandRow = typeof brandProductsSchema.$inferSelect;

export type GetAllBrandsResponse = Promise<
  | {
      success: true;
      data: BrandRow[];
      error: null;
    }
  | {
      success: false;
      error: unknown;
      data: [];
    }
>;

export type GetBrandBySlugResponse = Promise<
  | {
      success: true;
      error: null;
      data: BrandRow;
    }
  | {
      success: false;
      error: unknown;
      data: null;
    }
>;

function refreshBrandCacheTags(brandSlug?: string) {
  updateTag(CACHE_TAGS.brand.all);
  updateTag(CACHE_TAGS.catalog.filters);

  if (brandSlug) {
    updateTag(CACHE_TAGS.brand.bySlug(brandSlug));
  }
}

export async function getAllBrands(): GetAllBrandsResponse {
  "use cache";
  cacheTag(CACHE_TAGS.brand.all);
  cacheLife("minutes");

  try {
    const result = await withRetrySelective(
      () => db.select().from(brandProductsSchema),
      BRAND_READ_RETRY_OPTIONS,
    );

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return { success: false, error, data: [] };
  }
}

export async function createBrand(brand: BrandTypes) {
  try {
    const result = await db.insert(brandProductsSchema).values(brand).$returningId();
    refreshBrandCacheTags(brand.brand_slug);

    return {
      success: true,
      brandId: result[0].id,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function removeBrandById(brandId: BrandTypes["id"]) {
  if (!brandId) {
    return { success: false, error: "Brand ID is required", serverStatus: null };
  }
  try {
    const [existingBrand] = await db
      .select({ brand_slug: brandProductsSchema.brand_slug })
      .from(brandProductsSchema)
      .where(eq(brandProductsSchema.id, brandId));

    const result = await db.delete(brandProductsSchema).where(eq(brandProductsSchema.id, brandId));

    const affected = result[0].affectedRows;
    if (affected === 0) {
      return { success: false, error: "Brand not found" };
    }

    refreshBrandCacheTags(existingBrand?.brand_slug);

    return {
      success: true,
      serverStatus: result[0].serverStatus,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}

export async function updateBrandById(
  brandData: Partial<Omit<BrandTypes, "brand_slug">> & Pick<BrandTypes, "id">,
) {
  if (!brandData.id) {
    return { success: false, error: "Brand ID is required for update", serverStatus: null };
  }
  const existBrand = await db
    .select()
    .from(brandProductsSchema)
    .where(eq(brandProductsSchema.id, brandData.id));
  if (existBrand.length === 0) {
    return { success: false, error: "Brand not found", serverStatus: null };
  }

  try {
    const result = await db
      .update(brandProductsSchema)
      .set(brandData)
      .where(eq(brandProductsSchema.id, brandData.id));

    refreshBrandCacheTags(existBrand[0].brand_slug);

    return {
      success: true,
      serverStatus: result[0].serverStatus,
      error: null,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}

export async function getBrandBySlug(
  brand_slug: BrandTypes["brand_slug"],
): GetBrandBySlugResponse {
  "use cache";
  cacheTag(CACHE_TAGS.brand.bySlug(brand_slug));
  cacheLife("minutes");

  try {
    const rows = await withRetrySelective(
      () => db.select().from(brandProductsSchema).where(eq(brandProductsSchema.brand_slug, brand_slug)),
      BRAND_READ_RETRY_OPTIONS,
    );
    const fetchBrand = rows[0] ?? null;
    if (!fetchBrand) {
      return { success: false, error: "Brand not found", data: null };
    }

    return { success: true, error: null, data: fetchBrand };
  } catch (error) {
    return { success: false, error, data: null };
  }
}
