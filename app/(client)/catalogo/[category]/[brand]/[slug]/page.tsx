import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getProductBySlug } from "@/app/actions/product/get-product-by-slug";
import { baseUrl } from "@/types/baseUrl";
import PageSlug from "./PageSlug";
import { Suspense } from "react";
import ProductPageFallback from "./ProductPageFallback";

function normalizeSlugLabel(value: unknown) {
  return typeof value === "string" ? value.replace(/[-_]+/g, " ").trim() : "";
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeImageUrl(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; brand: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data, success } = await getProductBySlug(slug);

  if (!success || !data) {
    notFound();
  }

  const eanValue = normalizeOptionalText(data.ean);
  const brandLabel = normalizeSlugLabel(data.brand_slug);
  const categoryLabel = normalizeSlugLabel(data.category_slug);
  const slugLabel = normalizeSlugLabel(data.slug);
  const metadataImageUrl = normalizeImageUrl(data.imgSrc, "/logo.png");
  const descriptionWithEan = eanValue
    ? `${data.nameFull ?? ""}. Brand: ${brandLabel}. Categoria: ${categoryLabel}. EAN: ${eanValue}.`.trim()
    : `${data.nameFull ?? ""}. Brand: ${brandLabel}. Categoria: ${categoryLabel}.`.trim();
  const keywordCandidates = [
    data.name,
    data.nameFull,
    brandLabel,
    categoryLabel,
    slugLabel,
    eanValue ? `EAN ${eanValue}` : undefined,
    eanValue,
  ].filter(Boolean) as string[];
  const keywords = Array.from(new Set(keywordCandidates));
  const canonicalUrl = `${baseUrl}/catalogo/${data.category_slug}/${data.brand_slug}/${data.slug}`;

  return {
    title: `${data.name} | ${brandLabel} ${eanValue ? `| EAN ${eanValue}` : ""}`.trim(),
    description: descriptionWithEan,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      noarchive: false,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: data.name,
      description: descriptionWithEan,
      url: canonicalUrl,
      type: "website",
      siteName: "OnSmart",
      locale: "it_IT",
      images: [
        {
          url: metadataImageUrl,
          width: 1200,
          height: 630,
          alt: data.nameFull,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description: descriptionWithEan,
      images: [metadataImageUrl],
    },
    other: eanValue ? { "product:ean": eanValue } : undefined,
  };
}

async function CategoryBrandSlugContent({
  params,
}: {
  params: Promise<{ category: string; brand: string; slug: string }>;
}) {
  const { category, brand, slug } = await params;

  const productResponse = await getProductBySlug(slug);
  const product = productResponse.data;

  if (!productResponse.success || !product) {
    notFound();
  }

  if (product.category_slug !== category || product.brand_slug !== brand) {
    permanentRedirect(
      `/catalogo/${encodeURIComponent(product.category_slug)}/${encodeURIComponent(product.brand_slug)}/${encodeURIComponent(product.slug)}`,
    );
  }

  return <PageSlug slug={slug} initialProduct={product} />;
}

export default function CategoryBrandSlugIdPage({
  params,
}: PageProps<"/catalogo/[category]/[brand]/[slug]">) {
  return (
    <Suspense fallback={<ProductPageFallback />}>
      <CategoryBrandSlugContent params={params} />
    </Suspense>
  );
}
