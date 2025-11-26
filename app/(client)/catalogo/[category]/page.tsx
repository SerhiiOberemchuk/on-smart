import { Suspense } from "react";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return (
    <section>
      <Suspense>
        <h1>{category}</h1>
      </Suspense>
    </section>
  );
}
