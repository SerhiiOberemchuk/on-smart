import { Metadata } from "next";

import { getBrand } from "./action";
import { getAllProducts } from "@/app/actions/product/get-all-products";

import BrandPage from "@/components/BrandPage";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brandName = (await getBrand(brand)).brand;
  return { title: `Brand - ${brandName}` };
}

export default async function Page({ params }: Props) {
  const { brand } = await params;

  const products = await getAllProducts();

  return <BrandPage products={products} brand={brand} />;
}
