"use server";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { and, gt, like, or, sql } from "drizzle-orm";

export type GlobalSearchProductResult = {
  id: string;
  name: string;
  ean: string;
  slug: string;
  brand_slug: string;
  category_slug: string;
  productType: "product" | "bundle";
};

export type GlobalSearchBrandResult = {
  id: string;
  name: string;
  brand_slug: string;
};

export type GlobalSearchCategoryResult = {
  id: string;
  name: string;
  category_slug: string;
};

export type GlobalSearchResultsMeta = {
  products: {
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  brands: {
    limit: number;
    hasMore: boolean;
  };
  categories: {
    limit: number;
    hasMore: boolean;
  };
};

export type GlobalSearchResults = {
  products: GlobalSearchProductResult[];
  brands: GlobalSearchBrandResult[];
  categories: GlobalSearchCategoryResult[];
  meta: GlobalSearchResultsMeta;
};

export type GlobalSearchQueryOptions = {
  productsLimit?: number;
  productsOffset?: number;
  brandsLimit?: number;
  categoriesLimit?: number;
  includeBrandsAndCategories?: boolean;
};

const DEFAULT_PRODUCTS_LIMIT = 8;
const DEFAULT_BRANDS_LIMIT = 4;
const DEFAULT_CATEGORIES_LIMIT = 4;
const MAX_PRODUCTS_LIMIT = 24;
const MAX_TAXONOMY_LIMIT = 10;

const EAN_LIKE_QUERY = /^[\d\s-]+$/;
const TRANSIENT_DB_ERRORS = ["too many connections", "er_con_count_error", "connection", "timeout"];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildEmptyResults({
  productsLimit,
  productsOffset,
  brandsLimit,
  categoriesLimit,
}: {
  productsLimit: number;
  productsOffset: number;
  brandsLimit: number;
  categoriesLimit: number;
}): GlobalSearchResults {
  return {
    products: [],
    brands: [],
    categories: [],
    meta: {
      products: {
        offset: productsOffset,
        limit: productsLimit,
        hasMore: false,
      },
      brands: {
        limit: brandsLimit,
        hasMore: false,
      },
      categories: {
        limit: categoriesLimit,
        hasMore: false,
      },
    },
  };
}

function getErrorFingerprint(error: unknown) {
  if (!error || typeof error !== "object") {
    return String(error).toLowerCase();
  }

  const e = error as {
    message?: string;
    code?: string;
    sqlState?: string;
    cause?: { message?: string; code?: string; sqlState?: string };
  };

  return [e.message, e.code, e.sqlState, e.cause?.message, e.cause?.code, e.cause?.sqlState]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isTransientDbError(error: unknown) {
  const fingerprint = getErrorFingerprint(error);
  return TRANSIENT_DB_ERRORS.some((term) => fingerprint.includes(term));
}

async function withRetry<T>(queryFn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    if (!isTransientDbError(error) || retries <= 0) {
      throw error;
    }

    await delay(180);
    return withRetry(queryFn, retries - 1);
  }
}

export async function getHeaderGlobalSearchResults(
  query: string,
  options: GlobalSearchQueryOptions = {},
) {
  const normalized = query.trim();

  const productsLimit = clamp(
    Math.trunc(options.productsLimit ?? DEFAULT_PRODUCTS_LIMIT),
    1,
    MAX_PRODUCTS_LIMIT,
  );
  const productsOffset = Math.max(0, Math.trunc(options.productsOffset ?? 0));
  const brandsLimit = clamp(
    Math.trunc(options.brandsLimit ?? DEFAULT_BRANDS_LIMIT),
    1,
    MAX_TAXONOMY_LIMIT,
  );
  const categoriesLimit = clamp(
    Math.trunc(options.categoriesLimit ?? DEFAULT_CATEGORIES_LIMIT),
    1,
    MAX_TAXONOMY_LIMIT,
  );

  const emptyResults = buildEmptyResults({
    productsLimit,
    productsOffset,
    brandsLimit,
    categoriesLimit,
  });

  if (normalized.length < 2) {
    return { success: true, data: emptyResults, error: null };
  }

  const searchTerm = `%${normalized.replace(/\s+/g, "%")}%`;
  const searchTermLower = `%${normalized.toLowerCase().replace(/\s+/g, "%")}%`;
  const eanNormalized = normalized.replace(/\D/g, "");
  const eanSearchTerm = eanNormalized.length ? `%${eanNormalized}%` : null;
  const isEanLikeQuery = EAN_LIKE_QUERY.test(normalized) && eanNormalized.length >= 3;
  const includeBrandsAndCategories =
    options.includeBrandsAndCategories ?? (!isEanLikeQuery && normalized.length >= 3);

  try {
    const rawProducts = await withRetry(() =>
      db
        .select({
          id: productsSchema.id,
          name: productsSchema.name,
          ean: productsSchema.ean,
          slug: productsSchema.slug,
          brand_slug: productsSchema.brand_slug,
          category_slug: productsSchema.category_slug,
          productType: productsSchema.productType,
        })
        .from(productsSchema)
        .where(
          and(
            gt(productsSchema.inStock, 0),
            or(
              sql`LOWER(${productsSchema.name}) LIKE ${searchTermLower}`,
              sql`LOWER(${productsSchema.nameFull}) LIKE ${searchTermLower}`,
              sql`LOWER(${productsSchema.slug}) LIKE ${searchTermLower}`,
              sql`LOWER(${productsSchema.brand_slug}) LIKE ${searchTermLower}`,
              sql`LOWER(${productsSchema.category_slug}) LIKE ${searchTermLower}`,
              sql`LOWER(${productsSchema.id}) LIKE ${searchTermLower}`,
              ...(eanSearchTerm ? [like(productsSchema.ean, eanSearchTerm)] : []),
              ...(eanSearchTerm
                ? [sql`REPLACE(REPLACE(${productsSchema.ean}, '-', ''), ' ', '') LIKE ${eanSearchTerm}`]
                : []),
            ),
          ),
        )
        .orderBy(
          sql`CASE
                WHEN ${eanNormalized.length > 0 ? sql`REPLACE(REPLACE(${productsSchema.ean}, '-', ''), ' ', '') = ${eanNormalized}` : sql`FALSE`} THEN 0
                WHEN ${eanNormalized.length > 0 ? sql`REPLACE(REPLACE(${productsSchema.ean}, '-', ''), ' ', '') LIKE ${`${eanNormalized}%`}` : sql`FALSE`} THEN 1
                WHEN LOWER(${productsSchema.slug}) = ${normalized.toLowerCase()} THEN 2
                WHEN LOWER(${productsSchema.name}) LIKE ${searchTermLower} THEN 3
                ELSE 4
              END`,
          sql`${productsSchema.inStock} DESC`,
        )
        .limit(productsLimit + 1)
        .offset(productsOffset),
    );

    const productsHasMore = rawProducts.length > productsLimit;
    const products = productsHasMore ? rawProducts.slice(0, productsLimit) : rawProducts;

    const rawBrands = includeBrandsAndCategories
      ? await withRetry(() =>
          db
            .select({
              id: brandProductsSchema.id,
              name: brandProductsSchema.name,
              brand_slug: brandProductsSchema.brand_slug,
            })
            .from(brandProductsSchema)
            .where(
              or(
                like(brandProductsSchema.name, searchTerm),
                like(brandProductsSchema.title_full, searchTerm),
                like(brandProductsSchema.brand_slug, searchTerm),
              ),
            )
            .limit(brandsLimit + 1),
        )
      : [];

    const brandsHasMore = rawBrands.length > brandsLimit;
    const brands = brandsHasMore ? rawBrands.slice(0, brandsLimit) : rawBrands;

    const rawCategories = includeBrandsAndCategories
      ? await withRetry(() =>
          db
            .select({
              id: categoryProductsSchema.id,
              name: categoryProductsSchema.name,
              category_slug: categoryProductsSchema.category_slug,
            })
            .from(categoryProductsSchema)
            .where(
              or(
                like(categoryProductsSchema.name, searchTerm),
                like(categoryProductsSchema.title_full, searchTerm),
                like(categoryProductsSchema.category_slug, searchTerm),
              ),
            )
            .limit(categoriesLimit + 1),
        )
      : [];

    const categoriesHasMore = rawCategories.length > categoriesLimit;
    const categories = categoriesHasMore ? rawCategories.slice(0, categoriesLimit) : rawCategories;

    return {
      success: true,
      data: {
        products,
        brands,
        categories,
        meta: {
          products: {
            offset: productsOffset,
            limit: productsLimit,
            hasMore: productsHasMore,
          },
          brands: {
            limit: brandsLimit,
            hasMore: brandsHasMore,
          },
          categories: {
            limit: categoriesLimit,
            hasMore: categoriesHasMore,
          },
        },
      } satisfies GlobalSearchResults,
      error: null,
    };
  } catch (error) {
    if (isTransientDbError(error)) {
      console.error("[getHeaderGlobalSearchResults] transient DB error", error);
      return { success: true, data: emptyResults, error: null };
    }

    return {
      success: false,
      data: emptyResults,
      error,
    };
  }
}
