"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product.schema";
import { productCharacteristicProductSchema } from "@/db/schemas/product_characteristic_product.schema";
import { and, asc, desc, eq, gte, inArray, isNull, lte, sql, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export type CatalogSort = "price-asc" | "price-desc" | "new";
export type CatalogQueryPayload = {
  categorySlugs?: string[];
  brandSlugs?: string[];
  characteristics?: Record<string, string[]>;
  price?: { min?: number; max?: number };
  sort?: CatalogSort;
  page?: number;
  limit?: number;
  mode?: "parentsOnly" | "all";
};

type CatalogProductsFilteredResult = {
  success: boolean;
  data: typeof productsSchema.$inferSelect[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    mode: "parentsOnly" | "all";
    sort: CatalogSort;
  };
  errorCode: "DB_ERROR" | null;
  errorMessage: string | null;
};

export async function getAllProductsFiltered(
  payload: CatalogQueryPayload,
): Promise<CatalogProductsFilteredResult> {
  "use cache";
  cacheTag(CACHE_TAGS.product.all);
  cacheLife("minutes");

  const {
    categorySlugs,
    brandSlugs,
    characteristics,
    price,
    sort = "new",
    page = 1,
    limit = 20,
    mode = "all",
  } = payload;

  const safeSort: CatalogSort =
    sort === "price-asc" || sort === "price-desc" || sort === "new" ? sort : "new";
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.trunc(limit), 100) : 20;

  const effectiveProductId = sql<string>`
    COALESCE(${productsSchema.parent_product_id}, ${productsSchema.id})
  `;

  const where: SQL<unknown>[] = [];
  where.push(eq(productsSchema.isHidden, false));
  if (mode === "parentsOnly") where.push(isNull(productsSchema.parent_product_id));
  if (categorySlugs?.length) where.push(inArray(productsSchema.category_slug, categorySlugs));
  if (brandSlugs?.length) where.push(inArray(productsSchema.brand_slug, brandSlugs));
  if (price?.min !== undefined) where.push(gte(productsSchema.price, price.min.toString()));
  if (price?.max !== undefined) where.push(lte(productsSchema.price, price.max.toString()));

  if (characteristics) {
    const valueGroups = Object.values(characteristics).filter(
      (ids): ids is string[] => Array.isArray(ids) && ids.length > 0,
    );

    for (const valueIds of valueGroups) {
      where.push(
        sql`
          EXISTS (
            SELECT 1
            FROM ${productCharacteristicProductSchema}
            WHERE ${productCharacteristicProductSchema.product_id} = ${effectiveProductId}
            AND JSON_OVERLAPS(
              ${productCharacteristicProductSchema.value_ids},
              ${JSON.stringify(valueIds)}
            )
          )
        `,
      );
    }
  }

  const whereClause = where.length ? and(...where) : undefined;
  const orderBy =
    safeSort === "price-asc"
      ? asc(productsSchema.price)
      : safeSort === "price-desc"
      ? desc(productsSchema.price)
      : desc(productsSchema.id);

  try {
    const [{ total }] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(productsSchema)
      .where(whereClause);

    const normalizedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const safePage = Math.min(normalizedPage, totalPages);
    const safeOffset = (safePage - 1) * safeLimit;

    const data = await db
      .select()
      .from(productsSchema)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(safeLimit)
      .offset(safeOffset);

    return {
      success: true,
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        mode,
        sort: safeSort,
      },
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getAllProductsFiltered]", error);

    const limit =
      Number.isFinite(payload.limit) && (payload.limit ?? 0) > 0
        ? Math.min(Math.trunc(payload.limit as number), 100)
        : 20;
    const page =
      Number.isFinite(payload.page) && (payload.page ?? 0) > 0
        ? Math.trunc(payload.page as number)
        : 1;

    return {
      success: false,
      data: [],
      meta: {
        page,
        limit,
        total: 0,
        totalPages: 1,
        mode: payload.mode === "parentsOnly" ? "parentsOnly" : "all",
        sort:
          payload.sort === "price-asc" || payload.sort === "price-desc" || payload.sort === "new"
            ? payload.sort
            : "new",
      },
      errorCode: "DB_ERROR",
      errorMessage: "Failed to load catalog products",
    };
  }
}
