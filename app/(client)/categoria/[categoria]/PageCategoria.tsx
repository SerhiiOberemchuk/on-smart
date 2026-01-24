import { Metadata } from "next";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import Script from "next/script";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { baseUrl } from "@/types/baseUrl";
import { getCategoryBySlug } from "@/app/actions/category/category-actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LinkYellow from "@/components/YellowLink";
import { Suspense } from "react";

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const categoryInfo = await getCategoryBySlug(categoria);

  if (!categoryInfo.success || !categoryInfo.data) {
    return {
      title: "Categoria non trovata",
      robots: "noindex",
    };
  }

  return {
    title: `Categoria ${categoryInfo.data?.title_full} | OnSmart`,
    description:
      categoryInfo.data?.description ?? `Prodotti della categoria ${categoryInfo.data?.name}.`,
    alternates: {
      canonical: `${baseUrl}/categoria/${categoria}`,
    },
  };
}

export default async function PageCategoria({ params }: Props) {
  const { categoria } = await params;

  const { success, data } = await getCategoryBySlug(categoria);

  if (!success || !data) {
    notFound();
  }
  const products = await getAllProducts();
  if (!products.data) {
    return;
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Categoria ${data?.name}`,
    description: data?.description,
    url: `${baseUrl}/categoria/${categoria}`,
    hasPart: {
      "@type": "ItemList",
      itemListElement: products.data?.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          image: p.imgSrc,
          brand: p.brand_slug,
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: p.price,
            availability: "https://schema.org/InStock",
            url: `${baseUrl}/catalogo/${p.category_slug}/${p.brand_slug}/${p.slug}`,
          },
        },
      })),
    },
  };

  return (
    <>
      <nav className="py-3 text-sm text-text-grey">
        <ul className="text_R container flex flex-wrap gap-1 capitalize">
          <li>
            <Link href="/" className="hover:text-white">
              Home
            </Link>
          </li>
          <li>
            /<span className="text-white"> {data.name}</span>
          </li>
        </ul>
      </nav>
      <section className="bg-background">
        <div className="container">
          <h1 className="H2 py-3 text-left uppercase">{data.name}</h1>
          <div className="flex flex-col gap-5 py-3 xl:flex-row">
            <Image
              src={data.image}
              width={492}
              height={270}
              alt={data.name + "- Logo"}
              quality={100}
              className="h-[270px] w-[492px] object-contain object-center xl:px-6"
            />
            <ul className="flex flex-col gap-3">
              {data.description.split("|").map((desc, index) => (
                <li key={index}>
                  <p className="text_R"> {desc}</p>
                </li>
              ))}
              <LinkYellow
                title="Mostra tutto"
                href={`/catalogo?categoria=${data.category_slug}`}
                className="mr-auto flex"
              />
            </ul>
          </div>
        </div>
      </section>
      <Suspense>
        <ProductRowListSection
          productsList={products.data}
          idSection="categoria_section"
          title={`Prodotti della categoria ${data?.name}`}
          isBottomLink={false}
        />
      </Suspense>

      <Script
        id="category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
