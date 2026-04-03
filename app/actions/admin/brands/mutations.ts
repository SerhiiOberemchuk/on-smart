"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { BrandTypes } from "@/types/brands.types";

import { requireAdminSession } from "../_shared/require-admin-session";
import { refreshAdminBrandCacheTags } from "./cache-tags";

export async function createBrand(brand: BrandTypes) {
  await requireAdminSession();

  try {
    const result = await db.insert(brandProductsSchema).values(brand).$returningId();
    refreshAdminBrandCacheTags(brand.brand_slug);

    return {
      success: true,
      brandId: result[0].id,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function removeBrandById(brandId: BrandTypes["id"]) {
  await requireAdminSession();

  if (!brandId) {
    return { success: false, error: "Brand ID is required", serverStatus: null };
  }

  try {
    const [existingBrand] = await db
      .select({ brand_slug: brandProductsSchema.brand_slug })
      .from(brandProductsSchema)
      .where(eq(brandProductsSchema.id, brandId));

    const result = await db.delete(brandProductsSchema).where(eq(brandProductsSchema.id, brandId));

    if (result[0].affectedRows === 0) {
      return { success: false, error: "Brand not found" };
    }

    refreshAdminBrandCacheTags(existingBrand?.brand_slug);

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
  await requireAdminSession();

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

    refreshAdminBrandCacheTags(existBrand[0].brand_slug);

    return {
      success: true,
      serverStatus: result[0].serverStatus,
      error: null,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}
