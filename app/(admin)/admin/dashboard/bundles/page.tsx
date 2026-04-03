import { getAllBrands } from "@/app/actions/admin/brands/queries";
import { getAllBundlesAdmin } from "@/app/actions/admin/bundles/queries";
import {
  getAllCategoryProducts,
} from "@/app/actions/admin/categories/queries";
import { getAllProductsAdmin } from "@/app/actions/admin/products/queries";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import ClientPageAllBundles from "./PageAllBundles";

export default function BundlesPage() {
  const bundlesAction = getAllBundlesAdmin();
  const productsAction = getAllProductsAdmin({ includeHidden: true });
  const categoriesAction = getAllCategoryProducts();
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
