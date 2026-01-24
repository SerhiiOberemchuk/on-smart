import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import CategoriesClientPage from "./CategoryClientPage";
import { Suspense } from "react";

export default async function CategoriesPage() {
  "use cache";
  const res = getAllCategoryProducts();

  return (
    <Suspense>
      <CategoriesClientPage initialDataPromise={res} />
    </Suspense>
  );
}
