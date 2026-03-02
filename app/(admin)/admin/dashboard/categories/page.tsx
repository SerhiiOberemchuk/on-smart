import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import CategoriesClientPage from "./CategoryClientPage";
import { Suspense } from "react";

export default async function CategoriesPage() {
  const res = await getAllCategoryProducts();

  return (
    <Suspense>
      <CategoriesClientPage initialData={res} />
    </Suspense>
  );
}
