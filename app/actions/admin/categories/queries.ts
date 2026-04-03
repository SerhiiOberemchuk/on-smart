"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { requireAdminSession } from "../_shared/require-admin-session";

const CATEGORY_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;

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

export async function getAllCategoryProducts(): GetAllCategoriesResponse {
  await requireAdminSession();

  try {
    const result = await withRetrySelective(
      () => db.select().from(categoryProductsSchema),
      CATEGORY_READ_RETRY_OPTIONS,
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

export async function getCategoryBySlug(
  category_slug: CategoryRow["category_slug"],
): GetCategoryBySlugResponse {
  await requireAdminSession();

  try {
    const rows = await withRetrySelective(
      () =>
        db
          .select()
          .from(categoryProductsSchema)
          .where(eq(categoryProductsSchema.category_slug, category_slug)),
      CATEGORY_READ_RETRY_OPTIONS,
    );
    const fetchCategory = rows[0] ?? null;
    if (!fetchCategory) {
      return { success: false, error: "Category not found", data: null };
    }

    return { success: true, error: null, data: fetchCategory };
  } catch (error) {
    return { success: false, error, data: null };
  }
}
