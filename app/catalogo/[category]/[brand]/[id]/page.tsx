import { Suspense } from "react";

export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; id: string }>;
}) {
  const { category, brand, id } = await params;
  return (
    <div>
      Product page:
      <br />
      <Suspense>
        Category: {category}, Brand: {brand}, ID: {id}
      </Suspense>
    </div>
  );
}
