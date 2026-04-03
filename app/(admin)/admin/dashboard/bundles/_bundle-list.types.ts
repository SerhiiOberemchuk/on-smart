import type { BundleMetaType } from "@/db/schemas/bundle-meta.schema";
import type { ProductType } from "@/db/schemas/product.schema";

export type BundleListItem = ProductType & {
  bundleMeta: BundleMetaType | null;
};
