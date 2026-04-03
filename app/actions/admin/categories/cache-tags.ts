import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export function refreshAdminCategoryCacheTags(categorySlug?: string) {
  updateTag(CACHE_TAGS.category.all);
  updateTag(CACHE_TAGS.catalog.filters);

  if (categorySlug) {
    updateTag(CACHE_TAGS.category.bySlug(categorySlug));
  }
}
