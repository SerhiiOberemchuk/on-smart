"use server";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { and, eq, gt, isNull, like, or } from "drizzle-orm";

export type GlobalSearchProductResult = {
  id: string;
  name: string;
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

export type GlobalSearchResults = {
  products: GlobalSearchProductResult[];
  brands: GlobalSearchBrandResult[];
  categories: GlobalSearchCategoryResult[];
};

const EMPTY_RESULTS: GlobalSearchResults = {
  products: [],
  brands: [],
  categories: [],
};

const TRANSIENT_DB_ERRORS = ["too many connections", "er_con_count_error", "connection", "timeout"];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

export async function getGlobalSearchResults(query: string) {
  const normalized = query.trim();
  if (normalized.length < 2) {
    return { success: true, data: EMPTY_RESULTS, error: null };
  }

  const searchTerm = `%${normalized.replace(/\s+/g, "%")}%`;
  const eanNormalized = normalized.replace(/\D/g, "");
  const eanSearchTerm = eanNormalized.length ? `%${eanNormalized}%` : null;

  try {
    // Run queries sequentially to avoid opening multiple DB connections per keystroke.
    const products = await withRetry(() =>
      db
        .select({
          id: productsSchema.id,
          name: productsSchema.name,
          slug: productsSchema.slug,
          brand_slug: productsSchema.brand_slug,
          category_slug: productsSchema.category_slug,
          productType: productsSchema.productType,
        })
        .from(productsSchema)
        .where(
          and(
            or(gt(productsSchema.inStock, 0), eq(productsSchema.isOnOrder, true)),
            isNull(productsSchema.parent_product_id),
            or(
              like(productsSchema.name, searchTerm),
              like(productsSchema.nameFull, searchTerm),
              like(productsSchema.slug, searchTerm),
              ...(eanSearchTerm ? [like(productsSchema.ean, eanSearchTerm)] : []),
            ),
          ),
        )
        .limit(6),
    );

    const brands = await withRetry(() =>
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
        .limit(4),
    );

    const categories = await withRetry(() =>
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
        .limit(4),
    );

    return {
      success: true,
      data: {
        products,
        brands,
        categories,
      } satisfies GlobalSearchResults,
      error: null,
    };
  } catch (error) {
    if (isTransientDbError(error)) {
      console.error("[getGlobalSearchResults] transient DB error", error);
      return { success: true, data: EMPTY_RESULTS, error: null };
    }

    return {
      success: false,
      data: EMPTY_RESULTS,
      error,
    };
  }
}
