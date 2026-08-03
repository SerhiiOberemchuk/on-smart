"use server";

import { eq, isNull, and, sql } from "drizzle-orm";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { requireAdminSession } from "../_shared/require-admin-session";

const BRAND_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;

type BrandRow = typeof brandProductsSchema.$inferSelect;

export type CatalogCountRow = { slug: string; total: number; hidden: number };

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

export type GetBrandProductCountsResponse = Promise<
  | {
      success: true;
      data: CatalogCountRow[];
      error: null;
    }
  | {
      success: false;
      error: unknown;
      data: [];
    }
>;

export async function getBrandProductCounts(): GetBrandProductCountsResponse {
  await requireAdminSession();

  try {
    const rows = await withRetrySelective(
      () =>
        db
          .select({
            slug: productsSchema.brand_slug,
            total: sql<number>`COUNT(*)`,
            hidden: sql<number>`SUM(CASE WHEN ${productsSchema.isHidden} THEN 1 ELSE 0 END)`,
          })
          .from(productsSchema)
          .where(
            and(
              isNull(productsSchema.parent_product_id),
              eq(productsSchema.productType, "product"),
            ),
          )
          .groupBy(productsSchema.brand_slug),
      BRAND_READ_RETRY_OPTIONS,
    );

    const result = rows.map((row) => ({
      slug: row.slug,
      total: Number(row.total),
      hidden: Number(row.hidden),
    }));

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return { success: false, error, data: [] };
  }
}
