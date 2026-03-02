import { getAllBrands } from "@/app/actions/brands/brand-actions";
import BrandsPageClient from "./BrandPageClient";
import { Suspense } from "react";

export default async function BrandsPage() {
  "use cache";
  const res = await getAllBrands().catch((error) => {
    console.error("[AdminBrandsPage:getAllBrands]", error);
    return { success: false, data: [], error };
  });

  return (
    <Suspense>
      <BrandsPageClient brandsData={res.data} />
    </Suspense>
  );
}
