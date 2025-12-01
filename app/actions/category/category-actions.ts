"use server";

import { db } from "@/db/db";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { CategoryTypes } from "@/types/category.types";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function createCategoryProducts(category: CategoryTypes) {
  try {
    const result = await db.insert(categoryProductsSchema).values(category).$returningId();
    return {
      success: true,
      categoryId: result[0].id,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getAllCategoryProducts() {
  "use cache";
  cacheTag("all_categories");
  cacheLife({ expire: 7200 });
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
    const result = await db
      .delete(categoryProductsSchema)
      .where(eq(categoryProductsSchema.id, categoryId));

    const affected = result[0].affectedRows;
    if (affected === 0) {
      return { success: false, error: "Category not found" };
    }

    return {
      success: true,
      serverStatus: result[0].serverStatus,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}

export async function updateCategoryProductsById(categoryData: Partial<CategoryTypes>) {
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
  cacheTag(`category_${category_slug}`);
  cacheLife({ expire: 7200 }); // 2 hours
  try {
    const fetchCategory = await db
      .select()
      .from(categoryProductsSchema)
      .where(eq(categoryProductsSchema.category_slug, category_slug));
    if (fetchCategory.length === 0) {
      return { success: false, error: "Category not found", data: null };
    }
    return { success: true, error: null, data: fetchCategory[0] };
  } catch (error) {
    return { success: false, error, data: null };
  }
}
