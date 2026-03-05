import { getAllBrands, type GetAllBrandsResponse } from "@/app/actions/brands/brand-actions";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import BrandsPageClient from "./BrandPageClient";

export default function BrandsPage() {
  const brandsPromise: GetAllBrandsResponse = getAllBrands();

  return (
    <Suspense fallback={<Spiner />}>
      <BrandsPageClient brandsPromise={brandsPromise} />
    </Suspense>
  );
}
