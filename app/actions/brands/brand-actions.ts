"use server";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { BrandTypes } from "@/types/brands.types";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

import { eq } from "drizzle-orm";
import { cacheTag, updateTag } from "next/cache";

export async function createBrand(brand: BrandTypes) {
  try {
    const result = await db.insert(brandProductsSchema).values(brand).$returningId();
    updateTag(CACHE_TAGS.brand.all);
    updateTag(CACHE_TAGS.brand.bySlug(brand.brand_slug));
    return {
      success: true,
      brandId: result[0].id,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getAllBrands() {
  "use cache";
  cacheTag(CACHE_TAGS.brand.all);
  try {
    const result = await  db.select().from(brandProductsSchema);
    return {
      success: true,
      data: result,
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

    updateTag(CACHE_TAGS.brand.all);
    if (existingBrand?.brand_slug) {
      updateTag(CACHE_TAGS.brand.bySlug(existingBrand.brand_slug));
    }

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

    updateTag(CACHE_TAGS.brand.all);
    updateTag(CACHE_TAGS.brand.bySlug(existBrand[0].brand_slug));

    return {
      success: true,
      serverStatus: result[0].serverStatus,
      error: null,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}

export async function getBrandBySlug(brand_slug: BrandTypes["brand_slug"]) {
  "use cache";
  cacheTag(CACHE_TAGS.brand.bySlug(brand_slug));
  try {
    const fetchBrand = await db.select().from(brandProductsSchema).where(eq(brandProductsSchema.brand_slug, brand_slug));
    if (fetchBrand.length === 0) {
      return { success: false, error: "Brand not found", data: null };
    }
    return { success: true, error: null, data: fetchBrand[0] };
  } catch (error) {
    return { success: false, error, data: null };
  }
}
