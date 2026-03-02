import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { headers } from "next/headers";
import CategoriesClientPage from "./CategoryClientPage";
import { Suspense } from "react";

export default async function CategoriesPage() {
  await headers();
  const res = await getAllCategoryProducts();

  return (
    <Suspense>
      <CategoriesClientPage initialData={res} />
    </Suspense>
  );
}
