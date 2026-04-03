"use server";

import {
  getAllCharacteristicsWithMeta as getAllCharacteristicsWithMetaBase,
  getCharacteristicById as getCharacteristicByIdBase,
  type GetAllCharacteristicsWithMetaResponse,
} from "@/app/actions/product-characteristic/create-product-characteristic";
import { getAllCategoryProducts as getAllCategoryProductsBase } from "@/app/actions/admin/categories/queries";
import {
  getCharacteristicsByCategoryId as getCharacteristicsByCategoryIdBase,
  type GetCharacteristicsByCategoryIdType,
} from "@/app/actions/product-characteristic/get-characteristics-by-category-id";
import { getProductCharacteristics as getProductCharacteristicsBase } from "@/app/actions/product-characteristic/product-characteristic";

import { requireAdminSession } from "../_shared/require-admin-session";

export async function getAllCharacteristicsWithMeta(): GetAllCharacteristicsWithMetaResponse {
  await requireAdminSession();
  return getAllCharacteristicsWithMetaBase();
}

export async function getAllCategoryProducts() {
  await requireAdminSession();
  return getAllCategoryProductsBase();
}

export async function getCharacteristicsByCategoryId(
  ...args: Parameters<typeof getCharacteristicsByCategoryIdBase>
) {
  await requireAdminSession();
  return getCharacteristicsByCategoryIdBase(...args);
}

export async function getCharacteristicById(...args: Parameters<typeof getCharacteristicByIdBase>) {
  await requireAdminSession();
  return getCharacteristicByIdBase(...args);
}

export async function getProductCharacteristics(
  ...args: Parameters<typeof getProductCharacteristicsBase>
) {
  await requireAdminSession();
  return getProductCharacteristicsBase(...args);
}
