"use server";

import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product-schema";
import { safeQuery } from "@/utils/safeQuery";
// import { cacheTag } from "next/cache";

type Props = {
  page?: number;
  limit?: number;
  brand_slug?: string;
  category?: string;
};

// async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 120): Promise<T> {
//   try {
//     return await fn();
//   } catch (err) {
//     if (retries <= 0) throw err;
//     await new Promise((r) => setTimeout(r, delay));
//     return retry(fn, retries - 1, delay);
//   }
// }

export async function getAllProducts(props: Props = {}) {
  "use cache";
  // cacheTag("get_all_product");
  try {
    const response = await safeQuery(() => db.select().from(productsSchema));
    // const response = await db.select().from(productsSchema);

    return { success: true, data: response, error: null };
  } catch (error) {
    console.error("DB error:", error);
    return { success: false, error, data: null };
  }
}
