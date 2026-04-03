import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export function refreshAdminOrderCacheTags(orderId: string) {
  updateTag(CACHE_TAGS.orders.info);
  updateTag(CACHE_TAGS.orders.byId(orderId));
  updateTag(CACHE_TAGS.product.topSales);
}
