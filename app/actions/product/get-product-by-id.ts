"use server";

import { Product } from "@/types/product.types";
// import { setTimeout } from "node:timers/promises";
import { allProducts } from "../products";

export async function getProductById(id: string): Promise<Product | undefined> {
  const findProductById = allProducts.find((product) => product.id === id);
  // await setTimeout(2000);
  return findProductById;
}
