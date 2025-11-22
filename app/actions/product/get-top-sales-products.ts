"use server";

import { allProducts } from "@/app/actions/products";
import { cacheLife, cacheTag } from "next/cache";

export async function getTopSalesProducts() {
  "use cache: remote";
  cacheTag("top-sales-products");
  cacheLife({ expire: 3600 });
  const products = allProducts;

  return products;
}
