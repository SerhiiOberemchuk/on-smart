"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { safeQuery } from "@/utils/safeQuery";
import { cacheTag } from "next/cache";

type Props = {
  page?: number;
  limit?: number;
  brand_slug?: string;
  category?: string;
};
export type ProductFetchResult = {
  success: boolean;
  data: ProductType[] | null;
  error: string | null;
};

export async function getAllProducts() {
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
