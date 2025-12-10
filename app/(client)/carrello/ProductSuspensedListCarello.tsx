"use client";

import { ProductFetchResult } from "@/app/actions/product/get-all-products";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { use } from "react";

export default function ProductSuspensedListCarello({
  productsAction,
}: {
  productsAction: Promise<ProductFetchResult>;
}) {
  const products = use(productsAction);
  return (
    <ProductRowListSection
      title="Acquistati insieme"
      productsList={products.data || []}
      idSection="page_product_insieme"
      isBottomLink={false}
    />
  );
}
