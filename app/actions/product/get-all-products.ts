"use server";

import { allProducts } from "@/app/actions/products";
import { db } from "@/db/db";
import { productsSchema } from "@/db/schemas/product-schema";
import { cacheLife, cacheTag } from "next/cache";

type Props = {
  page?: number;
  limit?: number;
  brand_slug?: string;
  category?: string;
};

export async function getAllProducts(props: Props = {}) {
  "use cache"; // must be changed to "use cache: remote" if connecting to external DB
  cacheTag("all-products");
  cacheLife({ expire: 600 });
  const { page = 1, limit = 20, brand_slug } = props;
  try {
    const response = await db.select().from(productsSchema);
    return { success: true, data: response, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error, data: null };
  }
  // const products = allProducts;

  // return products;
}
