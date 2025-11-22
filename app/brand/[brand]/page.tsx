import BrandPage from "@/components/BrandPage";
import { Metadata } from "next";

// import { Suspense } from "react";
import { getBrand } from "./action";
import { baseUrl } from "@/types/baseUrl";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brandName = (await getBrand(brand)).brand;
  return {
    title: `Brand - ${brandName}`,
    description: `Scopri i prodotti del brand ${brandName} su OnSmart.`,
    alternates: {
      canonical: baseUrl + `/brand/${brand}`,
    },
  };
}

export default async function Page({ params }: Props) {
  return (
    // <Suspense>
    <BrandPage brand={(await params).brand} />
    // </Suspense>
  );
}
