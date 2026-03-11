import type { Metadata } from "next";
import { baseUrl } from "@/types/baseUrl";
import type { BundlePageData } from "./bundle-page.types";

export function buildBundleMetadata(bundle: BundlePageData): Metadata {
  const eanValue = bundle.ean?.trim();
  const imageUrl = bundle.imgSrc.startsWith("http")
    ? bundle.imgSrc
    : `${baseUrl}${bundle.imgSrc.startsWith("/") ? bundle.imgSrc : `/${bundle.imgSrc}`}`;
  const canonicalUrl = `${baseUrl}/catalogo/${bundle.category_slug}/${bundle.brand_slug}/bundle/${bundle.slug}`;
  const bundleDescription = (bundle.bundleMeta?.description ?? "").replace(/\s+/g, " ").trim();
  const descriptionWithEan = eanValue
    ? `${bundleDescription || bundle.nameFull}. Brand: ${bundle.brand_name}. Categoria: ${bundle.category_name}. EAN: ${eanValue}.`.trim()
    : `${bundleDescription || bundle.nameFull}. Brand: ${bundle.brand_name}. Categoria: ${bundle.category_name}.`.trim();
  const keywordCandidates = [
    bundle.name,
    bundle.nameFull,
    bundle.brand_name,
    bundle.category_name,
    bundle.slug.replace(/[-_]+/g, " ").trim(),
    "bundle",
    "kit",
    eanValue ? `EAN ${eanValue}` : undefined,
    eanValue,
    ...(bundle.bundleMeta?.advantages ?? []),
  ].filter(Boolean) as string[];
  const keywords = Array.from(new Set(keywordCandidates));
  const description =
    descriptionWithEan ||
    `${bundle.nameFull}. Bundle ${bundle.brand_name} nella categoria ${bundle.category_name}.`;

  return {
    title: `${bundle.name} | Kit ${bundle.brand_name} ${eanValue ? `| EAN ${eanValue}` : ""}`.trim(),
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: bundle.name,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: bundle.nameFull,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: bundle.name,
      description,
      images: [imageUrl],
    },
    other: eanValue ? { "product:ean": eanValue } : undefined,
  };
}
