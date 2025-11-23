import { parseSlugWithId } from "@/utils/parse-slug-with-Id";
import PageSlugId from "./PageSlugId";
import { Metadata } from "next";
import { getProductById } from "@/app/actions/product/get-product-by-id";
import { baseUrl } from "@/types/baseUrl";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; brand: string; slugId: string }>;
}): Promise<Metadata> {
  const { slugId } = await params;
  const { id } = parseSlugWithId(slugId);

  const product = await getProductById(id || "");

  if (!product) {
    notFound();
  }

  return {
    title: `${product.name} | ${product.brand}`,
    description: product.description ?? "",
    alternates: {
      canonical: `${baseUrl}/catalogo/${product.category}/${product.brand}/${slugId}`,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      url: `${baseUrl}/catalogo/${product.category}/${product.brand}/${slugId}`,
      images: [
        {
          url: product.imgSrc.startsWith("http") ? product.imgSrc : baseUrl + product.imgSrc,
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
  params: Promise<{ category: string; brand: string; slugId: string }>;
}) {
  const { slugId } = await params;
  const { id } = parseSlugWithId(slugId);

  if (!id) {
    return;
  }

  return <PageSlugId id={id} />;
}
