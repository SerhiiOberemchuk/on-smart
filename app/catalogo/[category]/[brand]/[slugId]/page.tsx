import { parseSlugWithId } from "@/utils/parse-slug-with-Id";
import PageSlugId from "./PageSlugId";
import { Suspense } from "react";

export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; slugId: string }>;
}) {
  const { slugId } = await params;
  const { id } = parseSlugWithId(slugId);
  console.log({ id });

  if (!id) {
    return;
  }

  return (
    <Suspense>
      <PageSlugId id={id} />
    </Suspense>
  );
}
