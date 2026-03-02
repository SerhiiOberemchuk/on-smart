import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { BundleFetchResult, getAllBundles } from "@/app/actions/bundles/get-all-bundles";
import {
  getAllCategoryProducts,
  type GetAllCategoriesResponse,
} from "@/app/actions/category/category-actions";
import { getAllProducts, ProductFetchResult } from "@/app/actions/product/get-all-products";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import ClientPageAllBundles from "./PageAllBundles";

export default function BundlesPage() {
  const bundlesAction: Promise<BundleFetchResult> = getAllBundles();
  const productsAction: Promise<ProductFetchResult> = getAllProducts();
  const categoriesAction: GetAllCategoriesResponse = getAllCategoryProducts();
  const brandsAction = getAllBrands();

  return (
    <Suspense fallback={<Spiner />}>
      <ClientPageAllBundles
        bundlesAction={bundlesAction}
        productsAction={productsAction}
        categoriesAction={categoriesAction}
        brandsAction={brandsAction}
      />
    </Suspense>
  );
}
