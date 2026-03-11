import { getBundleBySlug } from "@/app/actions/bundles/get-bundle-by-slug";
import type { ProductType } from "@/db/schemas/product.schema";

export type BundlePageParams = Promise<{
  category: string;
  brand: string;
  slug_bundle: string;
}>;

export type BundlePageData = NonNullable<Awaited<ReturnType<typeof getBundleBySlug>>["data"]>;

export type IncludedProductView = {
  productId: string;
  quantity: number;
  shortDescription: string;
};

export type IncludedProductCharacteristic = {
  name: string;
  value: string;
  position: number;
};

export type IncludedBundleProduct = {
  product: ProductType;
  quantity: number;
  shortDescription: string;
  characteristicTitle: string;
  characteristics: IncludedProductCharacteristic[];
};

export type BundleAvailability = {
  label: string;
  className: string;
  schema: string;
};
