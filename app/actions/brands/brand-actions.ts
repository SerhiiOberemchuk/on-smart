"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { BrandTypes } from "@/types/brands.types";
import { retryDb } from "@/utils/retry-db";

type BrandRow = typeof brandProductsSchema.$inferSelect;

type GetAllBrandsSuccess = {
  success: true;
  data: BrandRow[];
  error: null;
};

type GetAllBrandsFailure = {
  success: false;
  error: unknown;
  data: [];
};

export type GetAllBrandsResponse = Promise<GetAllBrandsSuccess | GetAllBrandsFailure>;

type GetBrandBySlugSuccess = {
  success: true;
  error: null;
  data: BrandRow;
};

type GetBrandBySlugFailure = {
  success: false;
  error: unknown;
  data: null;
};

export type GetBrandBySlugResponse = Promise<GetBrandBySlugSuccess | GetBrandBySlugFailure>;

function refreshBrandCacheTags(brandSlug?: string) {
  updateTag(CACHE_TAGS.brand.all);
  updateTag(CACHE_TAGS.catalog.filters);

  if (brandSlug) {
    updateTag(CACHE_TAGS.brand.bySlug(brandSlug));
  }
}

async function getAllBrandsCachedCore(): Promise<BrandRow[]> {
  "use cache";
  cacheTag(CACHE_TAGS.brand.all);
  cacheLife("minutes");

  return retryDb(() => db.select().from(brandProductsSchema));
}

async function getBrandBySlugCachedCore(
  brandSlug: BrandTypes["brand_slug"],
): Promise<BrandRow | null> {
  "use cache";
  cacheTag(CACHE_TAGS.brand.bySlug(brandSlug));
  cacheLife("minutes");

  const rows = await retryDb(() =>
    db.select().from(brandProductsSchema).where(eq(brandProductsSchema.brand_slug, brandSlug)),
  );

  return rows[0] ?? null;
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

export async function getAllBrands(): GetAllBrandsResponse {
  try {
    const result = await getAllBrandsCachedCore();

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return { success: false, error, data: [] };
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

  const existBrand = await db.select().from(brandProductsSchema).where(eq(brandProductsSchema.id, brandData.id));
  if (existBrand.length === 0) {
    return { success: false, error: "Brand not found", serverStatus: null };
  }

  try {
    const { id, ...payload } = brandData;
    const result = await db.update(brandProductsSchema).set(payload).where(eq(brandProductsSchema.id, id));

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
  brandSlug: BrandTypes["brand_slug"],
): GetBrandBySlugResponse {
  try {
    const fetchBrand = await getBrandBySlugCachedCore(brandSlug);

    if (!fetchBrand) {
      return { success: false, error: "Brand not found", data: null };
    }

    return { success: true, error: null, data: fetchBrand };
  } catch (error) {
    return { success: false, error, data: null };
  }
}
