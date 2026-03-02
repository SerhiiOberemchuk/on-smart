import { getAllBrands } from "@/app/actions/brands/brand-actions";
import Spiner from "@/components/Spiner";
import { headers } from "next/headers";
import { Suspense } from "react";
import BrandsPageClient from "./BrandPageClient";

export default function BrandsPage() {
  return (
    <Suspense fallback={<Spiner />}>
      <GetDataComponent />
    </Suspense>
  );
}

async function GetDataComponent() {
  await headers();
  const res = await getAllBrands();

  if (res.error) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return <BrandsPageClient brandsData={res.data} />;
}
