"use server";

import {
  getAllProducts as getAllProductsBase,
  type ProductFetchResult,
} from "@/app/actions/product/get-all-products";
import { getProductById as getProductByIdBase } from "@/app/actions/product/get-product-by-id";

import { requireAdminSession } from "../_shared/require-admin-session";

export async function getAllProductsAdmin(
  options?: { includeHidden?: boolean },
): Promise<ProductFetchResult> {
  await requireAdminSession();
  return getAllProductsBase(options);
}

export async function getProductByIdAdmin(id: string) {
  await requireAdminSession();
  return getProductByIdBase(id);
}

export async function getAllProducts(options?: { includeHidden?: boolean }): Promise<ProductFetchResult> {
  return getAllProductsAdmin(options);
}

export async function getProductById(id: string) {
  return getProductByIdAdmin(id);
}
