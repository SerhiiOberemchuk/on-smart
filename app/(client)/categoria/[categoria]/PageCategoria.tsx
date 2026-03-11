import { Metadata } from "next";
import Script from "next/script";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { baseUrl } from "@/types/baseUrl";
import { getCategoryBySlug } from "@/app/actions/category/category-actions";
import { notFound } from "next/navigation";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import LinkYellow from "@/components/YellowLink";
import { getAllProductsFiltered } from "@/app/actions/product/get-all-products-filtered";
import { ProductType } from "@/db/schemas/product.schema";

type Props = { params: Promise<{ categoria: string }> };

const CATEGORY_PRODUCTS_LIMIT = 24;

function buildProductHref(product: ProductType): string {
  if (product.productType === "bundle") {
    return `/catalogo/${product.category_slug}/${product.brand_slug}/bundle/${product.slug}`;
  }

  return `/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`;
}

function normalizeCategoryDescription(description: string): string {
  return description.replace(/\|/g, ". ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const categoryInfo = await getCategoryBySlug(categoria);

  if (!categoryInfo.success || !categoryInfo.data) {
    notFound();
  }

  const description = normalizeCategoryDescription(categoryInfo.data.description);
  const canonical = `${baseUrl}/categoria/${categoryInfo.data.category_slug}`;
  const title = `Categoria ${categoryInfo.data.title_full} | OnSmart`;

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
          url: categoryInfo.data.image || `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: categoryInfo.data.title_full,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [categoryInfo.data.image || `${baseUrl}/og-image.png`],
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
    description: category.description,
    url: `${baseUrl}/categoria/${category.category_slug}`,
    inLanguage: "it-IT",
    mainEntity: {
      "@type": "ItemList",
      name: `Prodotti della categoria ${category.name}`,
      numberOfItems: productsResponse.meta.total,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          image: product.imgSrc,
          brand: product.brand_slug,
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: product.price,
            availability: "https://schema.org/InStock",
            url: `${baseUrl}${buildProductHref(product)}`,
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
              <LinkYellow
                title="Mostra tutto"
                href={`/catalogo?categoria=${category.category_slug}`}
                className="mr-auto flex"
              />
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

      <Script
        id="category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

