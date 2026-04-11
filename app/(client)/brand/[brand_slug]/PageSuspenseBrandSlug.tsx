import BrandPage from "@/app/(client)/brand/[brand_slug]/components/BrandPage";
import { Metadata } from "next";

import { getBrandBySlug } from "@/app/actions/brands/brand-actions";
import { notFound } from "next/navigation";
import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";

type Props = { params: Promise<{ brand_slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand_slug } = await params;
  const { success, data } = await getBrandBySlug(brand_slug);

  if (!success || !data) {
    notFound();
  }

  const canonical = `${CONTACTS_ADDRESS.BASE_URL}/brand/${brand_slug}`;
  const title = `${data.name} - Prodotti ufficiali OnSmart`;
  const description = `Scopri i migliori prodotti del brand ${data.name}: videosorveglianza, accessori e soluzioni professionali disponibili su OnSmart.`;
  const imageUrl = data.image || `${CONTACTS_ADDRESS.BASE_URL}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      noarchive: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "OnSmart",
      locale: "it_IT",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Prodotti del brand ${data.name} su OnSmart`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PageBrandSlug({ params }: Props) {
  return <BrandPage brand_slug={(await params).brand_slug} />;
}
