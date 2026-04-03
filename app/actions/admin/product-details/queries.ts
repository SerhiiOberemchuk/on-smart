"use server";

import { getFotoFromGallery as getFotoFromGalleryBase } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { getProductDescriptionById as getProductDescriptionByIdBase } from "@/app/actions/product-details.ts/get-product-description";
import { getProductDocumentsById as getProductDocumentsByIdBase } from "@/app/actions/product-documents/get-product-documents";
import { getProductReviewsAdmin as getProductReviewsAdminBase } from "@/app/actions/product-reviews/get-product-reviews";
import { getProductSpecificheById as getProductSpecificheByIdBase } from "@/app/actions/product-specifiche/get-product-specifiche";

import { requireAdminSession } from "../_shared/require-admin-session";

export async function getFotoFromGallery(...args: Parameters<typeof getFotoFromGalleryBase>) {
  await requireAdminSession();
  return getFotoFromGalleryBase(...args);
}

export async function getProductDescriptionById(
  ...args: Parameters<typeof getProductDescriptionByIdBase>
) {
  await requireAdminSession();
  return getProductDescriptionByIdBase(...args);
}

export async function getProductDocumentsById(
  ...args: Parameters<typeof getProductDocumentsByIdBase>
) {
  await requireAdminSession();
  return getProductDocumentsByIdBase(...args);
}

export async function getProductReviewsAdmin(
  ...args: Parameters<typeof getProductReviewsAdminBase>
) {
  await requireAdminSession();
  return getProductReviewsAdminBase(...args);
}

export async function getProductSpecificheById(
  ...args: Parameters<typeof getProductSpecificheByIdBase>
) {
  await requireAdminSession();
  return getProductSpecificheByIdBase(...args);
}
