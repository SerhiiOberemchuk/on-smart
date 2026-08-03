import { getAllCategoryProducts, getCategoryProductCounts } from "@/app/actions/admin/categories/queries";
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
  const [listRes, countsRes] = await Promise.all([
    getAllCategoryProducts(),
    getCategoryProductCounts(),
  ]);

  if (listRes.error) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return (
    <CategoriesClientPage
      initialData={listRes}
      productCounts={countsRes.success ? countsRes.data : []}
    />
  );
}
