"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { db } from "@/db/db";
import { siteBannerSchema } from "@/db/schemas/site-banner.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { SITE_BANNER_VARIANT_LIST, type SiteBannerVariant } from "@/types/site-banner.types";

import { requireAdminSession } from "../_shared/require-admin-session";

export type SaveSiteBannerInput = {
  message: string;
  isActive: boolean;
  variant: SiteBannerVariant;
  linkUrl: string | null;
  linkLabel: string | null;
};

export async function saveSiteBanner(input: SaveSiteBannerInput) {
  await requireAdminSession();

  const variant: SiteBannerVariant = SITE_BANNER_VARIANT_LIST.includes(input.variant)
    ? input.variant
    : "info";

  const values = {
    message: input.message.trim() || null,
    isActive: input.isActive,
    variant,
    linkUrl: input.linkUrl?.trim() || null,
    linkLabel: input.linkLabel?.trim() || null,
  };

  try {
    // Singleton row: update in place if it exists, otherwise create it.
    const [existing] = await db
      .select({ id: siteBannerSchema.id })
      .from(siteBannerSchema)
      .limit(1);

    if (existing) {
      await db.update(siteBannerSchema).set(values).where(eq(siteBannerSchema.id, existing.id));
    } else {
      await db.insert(siteBannerSchema).values(values);
    }

    updateTag(CACHE_TAGS.siteBanner.current);

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}
