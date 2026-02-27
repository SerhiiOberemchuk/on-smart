"use server";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { and, gt, isNull, like, or } from "drizzle-orm";

export type GlobalSearchProductResult = {
  id: string;
  name: string;
  slug: string;
  brand_slug: string;
  category_slug: string;
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

export async function getGlobalSearchResults(query: string) {
  const normalized = query.trim();
  if (normalized.length < 2) {
    return { success: true, data: EMPTY_RESULTS, error: null };
  }

  const searchTerm = `%${normalized.replace(/\s+/g, "%")}%`;

  try {
    const [products, brands, categories] = await Promise.all([
      db
        .select({
          id: productsSchema.id,
          name: productsSchema.name,
          slug: productsSchema.slug,
          brand_slug: productsSchema.brand_slug,
          category_slug: productsSchema.category_slug,
        })
        .from(productsSchema)
        .where(
          and(
            gt(productsSchema.inStock, 0),
            isNull(productsSchema.parent_product_id),
            or(
              like(productsSchema.name, searchTerm),
              like(productsSchema.nameFull, searchTerm),
              like(productsSchema.slug, searchTerm),
            ),
          ),
        )
        .limit(6),
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
    ]);

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
    return {
      success: false,
      data: EMPTY_RESULTS,
      error,
    };
  }
}
