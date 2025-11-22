"use server";

import { allProducts, otherProducts, recomedProducts } from "../products";

export async function getProductsByIds(ids: { id: string }[]) {
  const products = ids.map((item) => {
    const findProduct = [...allProducts, ...otherProducts, ...recomedProducts].find(
      ({ id }) => id === item.id,
    );
    return findProduct;
  });
  // await setTimeout(2000);

  return products;
}
