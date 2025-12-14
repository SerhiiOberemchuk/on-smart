import { Suspense } from "react";
import PageSuspenseCategoryBrandSlug from "./PageSuspense";

export default function CategoryBrandSlugIdPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; slug: string }>;
}) {
  return (
    <Suspense fallback={<p>Carico...</p>}>
      <PageSuspenseCategoryBrandSlug params={params} />
    </Suspense>
  );
}
