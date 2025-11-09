"use server";

import { allProducts } from "@/app/actions/products";

export async function getAllProducts() {
  const products = allProducts;

  return products;
}
