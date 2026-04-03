"use server";

import {
  getAllBundles as getAllBundlesBase,
  type BundleFetchResult,
} from "@/app/actions/bundles/get-all-bundles";
import { getBundleById as getBundleByIdBase } from "@/app/actions/bundles/get-bundle-by-id";

import { requireAdminSession } from "../_shared/require-admin-session";

export async function getAllBundlesAdmin(): Promise<BundleFetchResult> {
  await requireAdminSession();
  return getAllBundlesBase();
}

export async function getBundleByIdAdmin(id: string) {
  await requireAdminSession();
  return getBundleByIdBase(id);
}

export async function getAllBundles(): Promise<BundleFetchResult> {
  return getAllBundlesAdmin();
}

export async function getBundleById(id: string) {
  return getBundleByIdAdmin(id);
}
