"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { CategoryTypes } from "@/types/category.types";

import { requireAdminSession } from "../_shared/require-admin-session";
import { refreshAdminCategoryCacheTags } from "./cache-tags";

export type {
  GetAllCategoriesFailure,
  GetAllCategoriesSuccess,
} from "./queries";

export async function createCategoryProducts(category: Omit<CategoryTypes, "id">) {
  await requireAdminSession();

  try {
    const result = await db.insert(categoryProductsSchema).values(category).$returningId();
    refreshAdminCategoryCacheTags(category.category_slug);

    return {
      success: true,
      categoryId: result[0].id,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function removeCategoryProductsById(categoryId: CategoryTypes["id"]) {
  await requireAdminSession();

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

    if (result[0].affectedRows === 0) {
      return { success: false, error: "Category not found" };
    }

    refreshAdminCategoryCacheTags(existingCategory?.category_slug);

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
  await requireAdminSession();

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

    refreshAdminCategoryCacheTags(existCategory[0].category_slug);

    return {
      success: true,
      serverStatus: result[0].serverStatus,
      error: null,
    };
  } catch (error) {
    return { success: false, error, serverStatus: null };
  }
}
