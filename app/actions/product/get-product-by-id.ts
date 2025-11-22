"use server";

import { Product } from "@/types/product.types";
import { allProducts } from "../products";

export async function getProductById(id: string): Promise<Product | undefined> {
  const findProductById = allProducts.find((product) => product.id === id);

  return findProductById;
}
