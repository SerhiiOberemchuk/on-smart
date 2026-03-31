import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import { getProductById } from "@/app/actions/product/get-product-by-id";
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
  const allProductsPromise: Promise<ProductType[]> = getAllProducts({ includeHidden: true }).then((res) =>
    res.success && res.data ? res.data : [],
  );

  const productPromise = getProductById(id).then((res) => {
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
