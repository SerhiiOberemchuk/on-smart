"use server";

import { allProducts } from "@/app/actions/products";

export async function getTopSalesProducts() {
  const products = allProducts;

  return products;
}
