"use server";

// import { setTimeout } from "node:timers/promises";
import { allProducts } from "../products";

export async function getProductById(id: string) {
  const findProductById = allProducts.find((product) => product.id === id);
  // await setTimeout(2000);
  return findProductById;
}
