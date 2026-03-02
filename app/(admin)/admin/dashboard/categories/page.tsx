import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import CategoriesClientPage from "./CategoryClientPage";
import { Suspense } from "react";

export default async function CategoriesPage() {
  "use cache";
  const res = getAllCategoryProducts().catch((error) => {
    console.error("[AdminCategoriesPage:getAllCategoryProducts]", error);
    return { success: false, data: [], error };
  });

  return (
    <Suspense>
      <CategoriesClientPage initialDataPromise={res} />
    </Suspense>
  );
}
