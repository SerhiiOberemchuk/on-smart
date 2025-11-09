"use server";

import { allProducts } from "@/app/actions/products";

export async function getSupportProductById(productId: string) {
  const products = allProducts;
  console.log({ productId });

  return products.slice(0, 4);
}
