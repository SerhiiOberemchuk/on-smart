"use server";

import { copyBundleById as copyBundleByIdBase } from "@/app/actions/bundles/copy-bundle";
import { createBundle as createBundleBase } from "@/app/actions/bundles/create-bundle";
import { deleteBundleReview as deleteBundleReviewBase } from "@/app/actions/bundles/delete-bundle-review";
import { deleteBundleById as deleteBundleByIdBase } from "@/app/actions/bundles/delete-bundle";
import { updateBundle as updateBundleBase } from "@/app/actions/bundles/update-bundle";

import { requireAdminSession } from "../_shared/require-admin-session";

export async function createBundle(...args: Parameters<typeof createBundleBase>) {
  await requireAdminSession();
  return createBundleBase(...args);
}

export async function updateBundle(...args: Parameters<typeof updateBundleBase>) {
  await requireAdminSession();
  return updateBundleBase(...args);
}

export async function deleteBundleById(...args: Parameters<typeof deleteBundleByIdBase>) {
  await requireAdminSession();
  return deleteBundleByIdBase(...args);
}

export async function copyBundleById(...args: Parameters<typeof copyBundleByIdBase>) {
  await requireAdminSession();
  return copyBundleByIdBase(...args);
}

export async function deleteBundleReview(...args: Parameters<typeof deleteBundleReviewBase>) {
  await requireAdminSession();
  return deleteBundleReviewBase(...args);
}
