import { Suspense } from "react";
import PageCatalogoCategoryBrand from "./PageSuspense";

export default function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string }>;
}) {
  return (
    <Suspense fallback={<p>Carico...</p>}>
      <PageCatalogoCategoryBrand params={params} />;
    </Suspense>
  );
}
