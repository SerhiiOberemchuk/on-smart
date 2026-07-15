"use server";

import { db } from "@/db/db";
import { siteBannerSchema, type SiteBannerType } from "@/db/schemas/site-banner.schema";

import { requireAdminSession } from "../_shared/require-admin-session";

export type GetSiteBannerAdminResponse =
  | { success: true; data: SiteBannerType | null; error: null }
  | { success: false; data: null; error: unknown };

export async function getSiteBannerAdmin(): Promise<GetSiteBannerAdminResponse> {
  await requireAdminSession();

  try {
    const rows = await db.select().from(siteBannerSchema).limit(1);
    return { success: true, data: rows[0] ?? null, error: null };
  } catch (error) {
    return { success: false, data: null, error };
  }
}
