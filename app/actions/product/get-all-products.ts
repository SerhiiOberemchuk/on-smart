"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product";
import { safeQuery } from "@/utils/safeQuery";
import { cacheTag } from "next/cache";

type Props = {
  page?: number;
  limit?: number;
  brand_slug?: string;
  category?: string;
};

export async function getAllProducts(props: Props = {}) {
  "use cache";

  cacheTag("get_all_product");

  try {
    const response = await safeQuery(() => db.select().from(productsSchema));
    return { success: true, data: response, error: null };
  } catch (error) {
    console.error("DB error:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
