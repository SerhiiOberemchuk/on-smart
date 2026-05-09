import { Suspense } from "react";
import PageBrandSlug from "./PageSuspenseBrandSlug";
type Props = { params: Promise<{ brand_slug: string }> };

export { generateMetadata } from "./PageSuspenseBrandSlug";

export default function Page({ params }: Props) {
  return (
    <Suspense>
      <PageBrandSlug params={params} />
    </Suspense>
  );
}
