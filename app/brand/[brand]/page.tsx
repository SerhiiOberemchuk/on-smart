import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import Section from "./Section";
import { getBrand } from "./action";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata(
  { params }: Props,
  //   parent: ResolvedMetadata,
): Promise<Metadata> {
  const { brand } = await params;
  const brandName = (await getBrand(brand)).brand;
  return { title: `Brand - ${brandName}` };
}

export default async function Page({ params }: Props) {
  const { brand } = await params;

  const brandName = (await getBrand(brand)).brand;

  return (
    <section>
      {/* <Suspense fallback={<p>Loading brand...</p>}> */}
      <p> page brand </p>
      {/* <p>{brandName}</p> */}

      {/* <Section title={brandName} /> */}
      {/* </Suspense> */}
    </section>
  );
}
