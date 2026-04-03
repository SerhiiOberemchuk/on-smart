import { getAllBrands } from "@/app/actions/admin/brands/queries";
import { getAllCategoryProducts } from "@/app/actions/admin/categories/queries";
import { getAllProductsAdmin, getProductByIdAdmin } from "@/app/actions/admin/products/queries";
import { BrandTypes } from "@/types/brands.types";
import { CategoryTypes } from "@/types/category.types";
import Spiner from "@/components/Spiner";
import { ProductType } from "@/db/schemas/product.schema";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageProductAdmin from "./components/PageProductAdmin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductPage({ params }: Props) {
  const { id } = await params;

  const categoriesPromise: Promise<CategoryTypes[]> = getAllCategoryProducts().then((res) =>
    res.success ? res.data : [],
  );
  const brandsPromise: Promise<BrandTypes[]> = getAllBrands().then((res) =>
    res.success ? res.data : [],
  );
  const allProductsPromise: Promise<ProductType[]> = getAllProductsAdmin({ includeHidden: true }).then((res) =>
    res.success && res.data ? res.data : [],
  );

  const productPromise = getProductByIdAdmin(id).then((res) => {
    if (!res.success || !res.data) {
      notFound();
    }
    return res.data;
  });

  return (
    <Suspense fallback={<Spiner />}>
      <PageProductAdmin
        dataAction={productPromise}
        categoriesAction={categoriesPromise}
        brandsAction={brandsPromise}
        allProductsAction={allProductsPromise}
      />
    </Suspense>
  );
}
