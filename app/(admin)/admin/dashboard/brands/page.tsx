import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { headers } from "next/headers";
import BrandsPageClient from "./BrandPageClient";
import { Suspense } from "react";

export default async function BrandsPage() {
  await headers();
  const res = await getAllBrands();

  return (
    <Suspense>
      <BrandsPageClient brandsData={res.data} />
    </Suspense>
  );
}
