import BrandPage from "@/components/BrandPage";
import { Suspense } from "react";

export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string }>;
}) {
  const { brand } = await params;

  return (
    <Suspense>
      <BrandPage brand={brand} />;
    </Suspense>
  );
}
