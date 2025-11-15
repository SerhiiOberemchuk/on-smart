"use server";

import { recomedProducts } from "@/app/actions/products";

export async function getSupportProductById(productId: string) {
  const products = recomedProducts;

  return products.slice(0, 4);
}
