"use server";

import { setTimeout } from "node:timers/promises";
import { allProducts, otherProducts, recomedProducts } from "../products";

export async function getProductsByIds(ids: { id: string }[]) {
  console.log({ ids });

  const products = ids.map((item) => {
    const findProduct = [...allProducts, ...otherProducts, ...recomedProducts].find(
      ({ id }) => id === item.id,
    );
    return findProduct;
  });
  await setTimeout(2000);
  console.log({ products });

  return products;
}
