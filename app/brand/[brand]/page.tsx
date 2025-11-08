import { Metadata } from "next";

import { getBrand } from "./action";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brandName = (await getBrand(brand)).brand;
  return { title: `Brand - ${brandName}` };
}

export default async function Page({ params }: Props) {
  const { brand } = await params;

  const brandName = (await getBrand(brand)).brand;

  return (
    <section>
      <p> page brand </p>
      <p>{brandName}</p>
    </section>
  );
}
