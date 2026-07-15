"use server";

import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db/db";
import { siteBannerSchema, type SiteBannerType } from "@/db/schemas/site-banner.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

/**
 * Public read for the header announcement bar. Returns the banner only when it
 * is active and actually has a message; otherwise null so nothing is rendered.
 * Cached and tag-invalidated whenever the admin saves the banner.
 */
export async function getActiveSiteBanner(): Promise<SiteBannerType | null> {
  "use cache";
  cacheTag(CACHE_TAGS.siteBanner.current);
  cacheLife("hours");

  try {
    const rows = await db.select().from(siteBannerSchema).limit(1);
    const banner = rows[0];

    if (!banner || !banner.isActive || !banner.message?.trim()) {
      return null;
    }

    return banner;
  } catch {
    return null;
  }
}
