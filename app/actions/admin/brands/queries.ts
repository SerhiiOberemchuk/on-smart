"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { requireAdminSession } from "../_shared/require-admin-session";

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

export async function getAllBrands(): GetAllBrandsResponse {
  await requireAdminSession();

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

export async function getBrandBySlug(brand_slug: BrandRow["brand_slug"]): GetBrandBySlugResponse {
  await requireAdminSession();

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
