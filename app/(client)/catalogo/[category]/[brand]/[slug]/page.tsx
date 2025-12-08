import PageSlug from "./PageSlug";
import { Metadata } from "next";
import { getProductBySlug } from "@/app/actions/product/get-product-by-slug";
import { baseUrl } from "@/types/baseUrl";
import { notFound } from "next/navigation";

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

  return {
    title: `${data.name} | ${data.brand_slug}`,
    description: data.nameFull ?? "",
    alternates: {
      canonical: `${baseUrl}/catalogo/${data.category_slug}/${data.brand_slug}/${data.slug}`,
    },
    openGraph: {
      title: data.name,
      description: data.nameFull,
      url: `${baseUrl}/catalogo/${data.category_slug}/${data.brand_slug}/${data.slug}`,
      images: [
        {
          url: data.imgSrc,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CategoryBrandSlugIdPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return <PageSlug slug={slug} />;
}
