"use server";

import { copyProductById as copyProductByIdBase } from "@/app/actions/product/copy-product";
import { createNewProduct as createNewProductBase } from "@/app/actions/product/create-new-product";
import { createProductVariant as createProductVariantBase } from "@/app/actions/product/create-product-variant";
import { deleteProductById as deleteProductByIdBase } from "@/app/actions/product/delete-product";
import { deleteProductVariant as deleteProductVariantBase } from "@/app/actions/product/delete-product-variant";
import { updateProductById as updateProductByIdBase } from "@/app/actions/product/update-product";

import { requireAdminSession } from "../_shared/require-admin-session";

export async function createNewProduct(...args: Parameters<typeof createNewProductBase>) {
  await requireAdminSession();
  return createNewProductBase(...args);
}

export async function updateProductById(...args: Parameters<typeof updateProductByIdBase>) {
  await requireAdminSession();
  return updateProductByIdBase(...args);
}

export async function deleteProductById(...args: Parameters<typeof deleteProductByIdBase>) {
  await requireAdminSession();
  return deleteProductByIdBase(...args);
}

export async function deleteProductVariant(...args: Parameters<typeof deleteProductVariantBase>) {
  await requireAdminSession();
  return deleteProductVariantBase(...args);
}

export async function copyProductById(...args: Parameters<typeof copyProductByIdBase>) {
  await requireAdminSession();
  return copyProductByIdBase(...args);
}

export async function createProductVariant(...args: Parameters<typeof createProductVariantBase>) {
  await requireAdminSession();
  return createProductVariantBase(...args);
}
