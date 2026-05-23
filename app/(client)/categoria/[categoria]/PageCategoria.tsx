import { Metadata } from "next";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { baseUrl } from "@/types/baseUrl";
import { getCategoryBySlug } from "@/app/actions/category/category-actions";
import { notFound } from "next/navigation";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import LinkYellow from "@/components/YellowLink";
import { getAllProductsFiltered } from "@/app/actions/product/get-all-products-filtered";
import { ProductType } from "@/db/schemas/product.schema";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildSeoDescription, buildSeoTitle, normalizeSeoText } from "@/lib/seo/metadata";
import {
  buildOfferPriceSpecification,
  buildOfferShippingAndReturnPolicy,
  buildProductPhysicalProperties,
} from "@/lib/seo/product-structured-data";
import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts";

type Props = { params: Promise<{ categoria: string }> };

const CATEGORY_PRODUCTS_LIMIT = 24;

function buildProductHref(product: ProductType): string {
  if (product.productType === "bundle") {
    return `/catalogo/${product.category_slug}/${product.brand_slug}/bundle/${product.slug}`;
  }

  return `/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`;
}

function normalizeCategoryDescription(description: string): string {
  return normalizeSeoText(description);
}

function toAbsoluteImageUrl(src: string) {
  if (!src) return `${baseUrl}/og-image.png`;
  return src.startsWith("http://") || src.startsWith("https://") ? src : `${baseUrl}${src}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const categoryInfo = await getCategoryBySlug(categoria);

  if (!categoryInfo.success || !categoryInfo.data) {
    notFound();
  }

  const categoryName = categoryInfo.data.name || categoryInfo.data.title_full;
  const description = buildSeoDescription({
    parts: [
      `Scopri ${categoryName}: prodotti selezionati, marchi affidabili, disponibilità aggiornata e spedizione in Italia.`,
      normalizeCategoryDescription(categoryInfo.data.description),
    ],
    fallback: `Prodotti ${categoryName} per sicurezza e smart home disponibili su OnSmart.`,
  });
  const canonical = `${baseUrl}/categoria/${categoryInfo.data.category_slug}`;
  const title = buildSeoTitle(`${categoryInfo.data.title_full} - Prodotti, prezzi e offerte`);
  const imageUrl = toAbsoluteImageUrl(categoryInfo.data.image);

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
          alt: `Prodotti della categoria ${categoryInfo.data.title_full} su OnSmart`,
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

export default async function PageCategoria({ params }: Props) {
  const { categoria } = await params;

  const [categoryResponse, productsResponse] = await Promise.all([
    getCategoryBySlug(categoria),
    getAllProductsFiltered({
      categorySlugs: [categoria],
      mode: "parentsOnly",
      limit: CATEGORY_PRODUCTS_LIMIT,
      sort: "new",
    }),
  ]);

  if (!categoryResponse.success || !categoryResponse.data) {
    notFound();
  }

  const category = categoryResponse.data;
  const products = productsResponse.data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Categoria ${category.name}`,
    description: normalizeCategoryDescription(category.description),
    url: `${baseUrl}/categoria/${category.category_slug}`,
    inLanguage: "it-IT",
    mainEntity: {
      "@type": "ItemList",
      name: `Prodotti della categoria ${category.name}`,
      numberOfItems: productsResponse.meta.total,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: products.map((product, index) => {
        const productPrice = Number(product.price ?? 0);

        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            image: toAbsoluteImageUrl(product.imgSrc),
            brand: {
              "@type": "Brand",
              name: product.brand_slug.replace(/[-_]+/g, " ").trim(),
            },
            category: category.name,
            ...buildProductPhysicalProperties(product),
            offers: {
              "@type": "Offer",
              priceCurrency: "EUR",
              price: productPrice,
              itemCondition: "https://schema.org/NewCondition",
              availability:
                product.inStock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              url: `${baseUrl}${buildProductHref(product)}`,
              ...buildOfferPriceSpecification({
                currentPrice: product.price,
                oldPrice: product.oldPrice,
              }),
              ...buildOfferShippingAndReturnPolicy(productPrice),
            },
          },
        };
      }),
    },
  } satisfies WithContext<CollectionPage>;
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${baseUrl}/categoria/${category.category_slug}`,
      },
    ],
  } satisfies WithContext<BreadcrumbList>;

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
            /<span className="text-white"> {category.name}</span>
          </li>
        </ul>
      </nav>
      <section className="bg-background">
        <div className="container">
          <h1 className="H2 py-3 text-left uppercase">{category.name}</h1>
          <div className="flex flex-col gap-5 py-3 xl:flex-row">
            <SmartImage
              src={category.image}
              width={492}
              height={270}
              alt={`${category.name} - Categoria`}
              quality={100}
              className="h-[270px] w-[492px] object-contain object-center xl:px-6"
            />
            <ul className="flex flex-col gap-3">
              {category.description.split("|").map((desc, index) => {
                const trimmed = desc.trim();
                if (!trimmed) return null;
                return (
                  <li key={`${trimmed}-${index}`}>
                    <p className="text_R">{trimmed}</p>
                  </li>
                );
              })}
              <li>
                <LinkYellow
                  title="Mostra tutto"
                  href={`/catalogo?categoria=${category.category_slug}`}
                  className="mr-auto flex"
                />
              </li>
            </ul>
          </div>
        </div>
      </section>

      {products.length > 0 ? (
        <ProductRowListSection
          productsList={products}
          idSection="categoria_section"
          title={`Prodotti della categoria ${category.name}`}
          isBottomLink={false}
        />
      ) : (
        <section className="py-8">
          <div className="container rounded-sm border border-stroke-grey p-4">
            <p className="text_R text-text-grey">
              Nessun prodotto disponibile al momento in questa categoria.
            </p>
          </div>
        </section>
      )}

      <JsonLd id="category-jsonld" data={jsonLd} />
      <JsonLd id="category-breadcrumbs-jsonld" data={breadcrumbsJsonLd} />
    </>
  );
}

