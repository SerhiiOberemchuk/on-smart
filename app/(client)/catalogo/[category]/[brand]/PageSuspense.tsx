import BrandPage from "@/app/(client)/brand/[brand_slug]/components/BrandPage";
import { Suspense } from "react";

export default async function PageCatalogoCategoryBrand({
  params,
}: {
  params: Promise<{ category: string; brand: string }>;
}) {
  const { brand } = await params;

  return (
    <Suspense>
      <BrandPage brand_slug={brand} />;
    </Suspense>
  );
}
