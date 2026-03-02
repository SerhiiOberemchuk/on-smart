"use server";

import { db } from "@/db/db";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { isBuildPhase } from "@/utils/guard-build";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { CategoryTypes } from "@/types/category.types";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";

const CATEGORY_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;
const BUILD_PHASE_SKIP_ERROR = "skipped: build phase";

type CategoryRow = typeof categoryProductsSchema.$inferSelect;

export type GetAllCategoriesSuccess = {
  success: true;
  data: CategoryRow[];
  error: null;
};

export type GetAllCategoriesFailure = {
  success: false;
  error: unknown;
  data: [];
};

export type GetAllCategoriesResponse = Promise<GetAllCategoriesSuccess | GetAllCategoriesFailure>;

export type GetCategoryBySlugResponse = Promise<
  | {
      success: true;
      error: null;
      data: CategoryRow;
    }
  | {
      success: false;
      error: unknown;
      data: null;
    }
>;

function refreshCategoryCacheTags(categorySlug?: string) {
  updateTag(CACHE_TAGS.category.all);
  updateTag(CACHE_TAGS.catalog.filters);

  if (categorySlug) {
    updateTag(CACHE_TAGS.category.bySlug(categorySlug));
  }
}

async function getAllCategoryProductsCachedCore(): Promise<CategoryRow[]> {
  "use cache";
  cacheTag(CACHE_TAGS.category.all);
  cacheLife("minutes");

  return withRetrySelective(
    () => db.select().from(categoryProductsSchema),
    CATEGORY_READ_RETRY_OPTIONS,
  );
}

async function getCategoryBySlugCachedCore(categorySlug: string): Promise<CategoryRow | null> {
  "use cache";
  cacheTag(CACHE_TAGS.category.bySlug(categorySlug));
  cacheLife("minutes");

  const rows = await withRetrySelective(
    () =>
      db
        .select()
        .from(categoryProductsSchema)
        .where(eq(categoryProductsSchema.category_slug, categorySlug)),
    CATEGORY_READ_RETRY_OPTIONS,
  );

  return rows[0] ?? null;
}

export async function createCategoryProducts(category: Omit<CategoryTypes, "id">) {
  try {
    const result = await db.insert(categoryProductsSchema).values(category).$returningId();
    refreshCategoryCacheTags(category.category_slug);

    return {
      success: true,
      categoryId: result[0].id,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getAllCategoryProducts(): GetAllCategoriesResponse {
  if (isBuildPhase()) {
    return { success: false, error: BUILD_PHASE_SKIP_ERROR, data: [] };
  }

  try {
    const result = await getAllCategoryProductsCachedCore();
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    return { success: false, error, data: [] };
  }
}

export async function removeCategoryProductsById(categoryId: CategoryTypes["id"]) {
  if (!categoryId) {
    return { success: false, error: "Category ID is required", serverStatus: null };
  }
  try {
    const [existingCategory] = await db
      .select({ category_slug: categoryProductsSchema.category_slug })
      .from(categoryProductsSchema)
      .where(eq(categoryProductsSchema.id, categoryId));

    const result = await db
      .delete(categoryProductsSchema)
      .where(eq(categoryProductsSchema.id, categoryId));

    const affected = result[0].affectedRows;
    if (affected === 0) {
      return { success: false, error: "Category not found" };
    }

    refreshCategoryCacheTags(existingCategory?.category_slug);

    return {
      success: true,
      serverStatus: result[0].serverStatus,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}

export async function updateCategoryProductsById(
  categoryData: Partial<Omit<CategoryTypes, "category_slug">>,
) {
  if (!categoryData.id) {
    return { success: false, error: "Category ID is required for update", serverStatus: null };
  }
  const existCategory = await db
    .select()
    .from(categoryProductsSchema)
    .where(eq(categoryProductsSchema.id, categoryData.id));
  if (existCategory.length === 0) {
    return { success: false, error: "Category not found", serverStatus: null };
  }

  try {
    const result = await db
      .update(categoryProductsSchema)
      .set(categoryData)
      .where(eq(categoryProductsSchema.id, categoryData.id));

    refreshCategoryCacheTags(existCategory[0].category_slug);

    return {
      success: true,
      serverStatus: result[0].serverStatus,
      error: null,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}

export async function getCategoryBySlug(
  category_slug: CategoryTypes["category_slug"],
): GetCategoryBySlugResponse {
  if (isBuildPhase()) {
    return { success: false, error: BUILD_PHASE_SKIP_ERROR, data: null };
  }

  try {
    const fetchCategory = await getCategoryBySlugCachedCore(category_slug);

    if (!fetchCategory) {
      return { success: false, error: "Category not found", data: null };
    }

    return { success: true, error: null, data: fetchCategory };
  } catch (error) {
    return { success: false, error, data: null };
  }
}
