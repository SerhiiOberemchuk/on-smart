"use server";

import { db } from "@/db/db";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { CategoryTypes } from "@/types/category.types";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";

export async function createCategoryProducts(category: Omit<CategoryTypes, "id">) {
  try {
    const result = await db.insert(categoryProductsSchema).values(category).$returningId();
    updateTag(CACHE_TAGS.category.all);
    updateTag(CACHE_TAGS.category.bySlug(category.category_slug));
    return {
      success: true,
      categoryId: result[0].id,
    };
  } catch (error) {
    return { success: false, error };
  }
}
export type GetAllCategoriesResponse = Promise<
  | {
      success: boolean;
      data: {
        id: string;
        name: string;
        title_full: string;
        description: string;
        image: string;
        category_slug: string;
      }[];
      error?: undefined;
    }
  | {
      success: boolean;
      error: unknown;
      data: never[];
    }
>;
export async function getAllCategoryProducts(): GetAllCategoriesResponse {
  "use cache";
  cacheTag(CACHE_TAGS.category.all);
  cacheLife("hours");

  try {
    const result = await db.select().from(categoryProductsSchema);

    return {
      success: true,
      data: result,
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

    updateTag(CACHE_TAGS.category.all);
    if (existingCategory?.category_slug) {
      updateTag(CACHE_TAGS.category.bySlug(existingCategory.category_slug));
    }

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

    updateTag(CACHE_TAGS.category.all);
    updateTag(CACHE_TAGS.category.bySlug(existCategory[0].category_slug));

    return {
      success: true,
      serverStatus: result[0].serverStatus,
      error: null,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}

export async function getCategoryBySlug(category_slug: CategoryTypes["category_slug"]) {
  "use cache";
  cacheTag(CACHE_TAGS.category.bySlug(category_slug));
  try {
    const fetchCategory = await db.select().from(categoryProductsSchema).where(eq(categoryProductsSchema.category_slug, category_slug));
    if (fetchCategory.length === 0) {
      return { success: false, error: "Category not found", data: null };
    }
    return { success: true, error: null, data: fetchCategory[0] };
  } catch (error) {
    return { success: false, error, data: null };
  }
}
