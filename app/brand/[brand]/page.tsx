import { Metadata } from "next";
import { Suspense } from "react";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata(
  { params }: Props,
  //   parent: ResolvedMetadata,
): Promise<Metadata> {
  const { brand } = await params;
  return { title: `Brand - ${brand}` };
}

export default async function Page({ params }: Props) {
  "use cache";

  const { brand } = await params;

  return (
    <>
      <Suspense>
        <section>page brand {JSON.stringify(brand)}</section>
      </Suspense>
    </>
  );
}
