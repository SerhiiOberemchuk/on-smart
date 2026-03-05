import {
  getAllCategoryProducts,
  type GetAllCategoriesResponse,
} from "@/app/actions/category/category-actions";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import CategoriesClientPage from "./CategoryClientPage";

export default function CategoriesPage() {
  const categoriesPromise: GetAllCategoriesResponse = getAllCategoryProducts();

  return (
    <Suspense fallback={<Spiner />}>
      <CategoriesClientPage initialDataPromise={categoriesPromise} />
    </Suspense>
  );
}
