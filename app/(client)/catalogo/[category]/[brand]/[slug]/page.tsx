import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/actions/product/get-product-by-slug";
import { baseUrl } from "@/types/baseUrl";
import PageSlug from "./PageSlug";
import { Suspense } from "react";

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

  const eanValue = data.ean?.trim();
  const brandLabel = data.brand_slug.replace(/[-_]+/g, " ").trim();
  const categoryLabel = data.category_slug.replace(/[-_]+/g, " ").trim();
  const descriptionWithEan = eanValue
    ? `${data.nameFull ?? ""}. Brand: ${brandLabel}. Categoria: ${categoryLabel}. EAN: ${eanValue}.`.trim()
    : `${data.nameFull ?? ""}. Brand: ${brandLabel}. Categoria: ${categoryLabel}.`.trim();
  const keywordCandidates = [
    data.name,
    data.nameFull,
    brandLabel,
    categoryLabel,
    data.slug.replace(/[-_]+/g, " ").trim(),
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
      images: [
        {
          url: data.imgSrc,
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
      images: [data.imgSrc],
    },
    other: eanValue ? { "product:ean": eanValue } : undefined,
  };
}

async function CategoryBrandSlugContent({
  params,
}: {
  params: Promise<{ category: string; brand: string; slug: string }>;
}) {
  const { slug } = await params;
  return <PageSlug slug={slug} />;
}

export default function CategoryBrandSlugIdPage({
  params,
}: PageProps<"/catalogo/[category]/[brand]/[slug]">) {
  return (
    <Suspense fallback={<p>Carico...</p>}>
      <CategoryBrandSlugContent params={params} />
    </Suspense>
  );
}
