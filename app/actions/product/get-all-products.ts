"use server";

import { allProducts } from "@/app/actions/products";

type Props = {
  page?: number;
  limit?: number;
};

export async function getAllProducts(props: Props = {}) {
  const { page = 1, limit = 20 } = props;
  const products = allProducts;

  return products;
}
