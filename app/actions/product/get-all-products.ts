"use server";

import { allProducts } from "@/app/actions/products";
import { cacheLife, cacheTag } from "next/cache";

type Props = {
  page?: number;
  limit?: number;
  brand_slug?: string;
  category?: string;
};

export async function getAllProducts(props: Props = {}) {
  "use cache"; // must be changed to "use cache: remote" if connecting to external DB
  cacheTag("all-products");
  cacheLife({ expire: 600 });
  const { page = 1, limit = 20, brand_slug } = props;
  const products = allProducts;

  return products;
}
