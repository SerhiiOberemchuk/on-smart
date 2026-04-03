"use server";

import {
  createCharacteristic as createCharacteristicBase,
  deleteCharacteristic as deleteCharacteristicBase,
  updateCharacteristic as updateCharacteristicBase,
} from "@/app/actions/product-characteristic/create-product-characteristic";
import { createProductCharacteristicValues as createProductCharacteristicValuesBase } from "@/app/actions/product-characteristic/create-product-characteristic-values";
import {
  upsertProductCharacteristic as upsertProductCharacteristicBase,
  deleteProductCharacteristic as deleteProductCharacteristicBase,
} from "@/app/actions/product-characteristic/product-characteristic";
import { updateOrCreateSpecifiche as updateOrCreateSpecificheBase } from "@/app/actions/product-specifiche/update-or-create-specifiche";
import { updateProductDescriptionById as updateProductDescriptionByIdBase } from "@/app/actions/product-details.ts/update-product-description copy";
import { updateProductDocumentsById as updateProductDocumentsByIdBase } from "@/app/actions/product-documents/update-product-documents";
import { updateFotoGallery as updateFotoGalleryBase } from "@/app/actions/foto-galery/update-foto-gallery";
import { deleteProductReviewById as deleteProductReviewByIdBase } from "@/app/actions/product-reviews/delete-review";
import { updateProductReviewById as updateProductReviewByIdBase } from "@/app/actions/product-reviews/update-review";

import { requireAdminSession } from "../_shared/require-admin-session";

export async function createCharacteristic(...args: Parameters<typeof createCharacteristicBase>) {
  await requireAdminSession();
  return createCharacteristicBase(...args);
}

export async function updateCharacteristic(...args: Parameters<typeof updateCharacteristicBase>) {
  await requireAdminSession();
  return updateCharacteristicBase(...args);
}

export async function deleteCharacteristic(...args: Parameters<typeof deleteCharacteristicBase>) {
  await requireAdminSession();
  return deleteCharacteristicBase(...args);
}

export async function createProductCharacteristicValues(
  ...args: Parameters<typeof createProductCharacteristicValuesBase>
) {
  await requireAdminSession();
  return createProductCharacteristicValuesBase(...args);
}

export async function createProductCharacteristic(
  ...args: Parameters<typeof upsertProductCharacteristicBase>
) {
  await requireAdminSession();
  return upsertProductCharacteristicBase(...args);
}

export async function deleteProductCharacteristicValue(
  ...args: Parameters<typeof deleteProductCharacteristicBase>
) {
  await requireAdminSession();
  return deleteProductCharacteristicBase(...args);
}

export async function upsertProductCharacteristic(
  ...args: Parameters<typeof upsertProductCharacteristicBase>
) {
  await requireAdminSession();
  return upsertProductCharacteristicBase(...args);
}

export async function deleteProductCharacteristic(
  ...args: Parameters<typeof deleteProductCharacteristicBase>
) {
  await requireAdminSession();
  return deleteProductCharacteristicBase(...args);
}

export async function updateOrCreateSpecifiche(
  ...args: Parameters<typeof updateOrCreateSpecificheBase>
) {
  await requireAdminSession();
  return updateOrCreateSpecificheBase(...args);
}

export async function updateProductDescriptionById(
  ...args: Parameters<typeof updateProductDescriptionByIdBase>
) {
  await requireAdminSession();
  return updateProductDescriptionByIdBase(...args);
}

export async function updateProductDocumentsById(
  ...args: Parameters<typeof updateProductDocumentsByIdBase>
) {
  await requireAdminSession();
  return updateProductDocumentsByIdBase(...args);
}

export async function updateFotoGallery(...args: Parameters<typeof updateFotoGalleryBase>) {
  await requireAdminSession();
  return updateFotoGalleryBase(...args);
}

export async function deleteProductReviewById(
  ...args: Parameters<typeof deleteProductReviewByIdBase>
) {
  await requireAdminSession();
  return deleteProductReviewByIdBase(...args);
}

export async function updateProductReviewById(
  ...args: Parameters<typeof updateProductReviewByIdBase>
) {
  await requireAdminSession();
  return updateProductReviewByIdBase(...args);
}
