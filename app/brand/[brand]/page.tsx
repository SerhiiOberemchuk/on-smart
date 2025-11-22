import BrandPage from "@/components/BrandPage";
import { Metadata } from "next";

import { getBrand } from "./action";
import { baseUrl } from "@/types/baseUrl";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const brandInfo = await getBrand(brand);

  if (!brandInfo) {
    return {
      title: "Brand non trovato",
      robots: "noindex",
    };
  }

  const canonical = `${baseUrl}/brand/${brand}`;
  const title = `${brandInfo.brand} – Prodotti ufficiali OnSmart`;
  const description = `Scopri i migliori prodotti del brand ${brandInfo.brand}: videosorveglianza, accessori e soluzioni professionali disponibili su OnSmart.`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "OnSmart",
      images: [
        {
          url: brandInfo.logo,
          width: 600,
          height: 400,
          alt: `${brandInfo.brand} Logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [brandInfo.logo],
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
