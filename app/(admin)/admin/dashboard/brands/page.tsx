import { getAllBrands } from "@/app/actions/brands/brand-actions";
import BrandsPageClient from "./BrandPageClient";
import { Suspense } from "react";

export default async function BrandsPage() {
  "use cache";
  const res = await getAllBrands();

  return (
    <Suspense>
      <BrandsPageClient brandsData={res.data} />
    </Suspense>
  );
}
