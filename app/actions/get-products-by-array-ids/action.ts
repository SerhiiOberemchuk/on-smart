"use server";

import { setTimeout } from "node:timers/promises";
import { allProducts } from "../products";

export async function getProductsByIds(ids: { id: string }[]) {
  const products = ids.map((item) => {
    const findProduct = allProducts.find(({ id }) => id === item.id);
    return findProduct;
  });
  await setTimeout(2000);
  return products;
}
