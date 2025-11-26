import { Metadata } from "next";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import Script from "next/script";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { baseUrl } from "@/types/baseUrl";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCategoryInfo } from "@/app/actions/category/get-category-info";

type Props = { params: Promise<{ categoria: string }> };

// SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const categoryInfo = await getCategoryInfo(categoria);

  return {
    title: `Categoria ${categoryInfo.name} | OnSmart`,
    description: categoryInfo.descriptionSeo ?? `Prodotti della categoria ${categoryInfo.name}.`,
    alternates: {
      canonical: `${baseUrl}/categoria/${categoria}`,
    },
  };
}

export default async function PageCategoria({ params }: Props) {
  const { categoria } = await params;

  const categoryInfo = await getCategoryInfo(categoria);
  const products = await getAllProducts({ category: categoria });

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Categoria ${categoryInfo.name}`,
    description: categoryInfo.descriptionSeo,
    url: `${baseUrl}/categoria/${categoria}`,
    hasPart: {
      "@type": "ItemList",
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          image: p.imgSrc,
          brand: p.brand,
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: p.price,
            availability: "https://schema.org/InStock",
            url: `${baseUrl}/catalogo/${p.category}/${p.brand}/${p.id}`,
          },
        },
      })),
    },
  };

  return (
    <>
      <Breadcrumbs category={categoryInfo.name} />

      <section className="bg-background">
        <div className="container py-6">
          <h1 className="H2 uppercase">{categoryInfo.name}</h1>

          {categoryInfo.description && <p className="text_R mt-3">{categoryInfo.description}</p>}
        </div>
      </section>

      <ProductRowListSection
        productsList={products}
        idSection="categoria_section"
        title={`Prodotti della categoria ${categoryInfo.name}`}
        isBottomLink={false}
      />

      <Script
        id="category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
