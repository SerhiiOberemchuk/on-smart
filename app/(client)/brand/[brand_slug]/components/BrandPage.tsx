import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import SmartImage from "@/components/SmartImage";
import LinkYellow from "@/components/YellowLink";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";
import { BrandTypes } from "@/types/brands.types";
import { getBrandBySlug } from "@/app/actions/brands/brand-actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProductsFiltered } from "@/app/actions/product/get-all-products-filtered";
import { ProductType } from "@/db/schemas/product.schema";

const BRAND_PRODUCTS_LIMIT = 24;

function buildProductHref(product: ProductType): string {
  if (product.productType === "bundle") {
    return `/catalogo/${product.category_slug}/${product.brand_slug}/bundle/${product.slug}`;
  }

  return `/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`;
}

export default async function BrandPage({ brand_slug }: { brand_slug: BrandTypes["brand_slug"] }) {
  const [brandResponse, productsResponse] = await Promise.all([
    getBrandBySlug(brand_slug),
    getAllProductsFiltered({
      brandSlugs: [brand_slug],
      mode: "parentsOnly",
      limit: BRAND_PRODUCTS_LIMIT,
      sort: "new",
    }),
  ]);

  if (!brandResponse.success || !brandResponse.data) {
    notFound();
  }

  const brand = brandResponse.data;
  const products = productsResponse.data;

  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    logo: brand.image,
    url: `${baseUrl}/brand/${brand_slug}`,
    description: brand.description,
  };

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Prodotti del brand ${brand.name}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: productsResponse.meta.total,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          image: product.imgSrc,
          brand: {
            "@type": "Brand",
            name: brand.name,
          },
          description: product.nameFull,
          category: product.category_slug.replace(/[-_]+/g, " ").trim(),
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
          price: product.price,
          url: `${baseUrl}${buildProductHref(product)}`,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
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
        name: brand.name,
        item: `${baseUrl}/brand/${brand_slug}`,
      },
    ],
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
            /<span className="text-white"> {brand.name}</span>
          </li>
        </ul>
      </nav>
      <section className="bg-background">
        <div className="container">
          <h1 className="H2 py-3 text-left uppercase">{brand.name}</h1>
          <div className="flex flex-col gap-5 py-3 xl:flex-row">
            <SmartImage
              src={brand.image}
              width={492}
              height={270}
              alt={`${brand.name} - Logo`}
              quality={100}
              className="h-[270px] w-[492px] object-contain object-center xl:px-6"
            />
            <ul className="flex flex-col gap-3">
              {brand.description.split("|").map((desc, index) => {
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
                  href={`/catalogo?brand=${brand.brand_slug}`}
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
          title="I best seller del marchio"
          idSection="brand_best_sellers"
          isBottomLink={true}
        />
      ) : (
        <section className="py-8">
          <div className="container rounded-sm border border-stroke-grey p-4">
            <p className="text_R text-text-grey">
              Nessun prodotto disponibile al momento per questo brand.
            </p>
          </div>
        </section>
      )}
      <Script
        id="brand-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
      />
      <Script
        id="brand-products-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />
      <Script
        id="brand-breadcrumbs-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
    </>
  );
}

