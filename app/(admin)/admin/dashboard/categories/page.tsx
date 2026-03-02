import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import Spiner from "@/components/Spiner";
import { headers } from "next/headers";
import { Suspense } from "react";
import CategoriesClientPage from "./CategoryClientPage";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<Spiner />}>
      <GetDataComponent />
    </Suspense>
  );
}

async function GetDataComponent() {
  await headers();
  const res = await getAllCategoryProducts();

  if (res.error) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return <CategoriesClientPage initialData={res} />;
}
