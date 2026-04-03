import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export function refreshAdminBrandCacheTags(brandSlug?: string) {
  updateTag(CACHE_TAGS.brand.all);
  updateTag(CACHE_TAGS.catalog.filters);

  if (brandSlug) {
    updateTag(CACHE_TAGS.brand.bySlug(brandSlug));
  }
}
