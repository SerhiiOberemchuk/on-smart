import { getAllProducts } from "@/app/actions/product/get-all-products";
import { getProductBySlug } from "@/app/actions/product/get-product-by-slug";
import { getProductDetailsById } from "@/app/actions/product/get-product-details-by-Id";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCharacteristicsSection from "@/components/ProductPageSections/ProductCharacteristicsSection/ProductCharacteristacSection";
import VisualProductSection from "@/components/ProductPageSections/VisualTopSection/VisualProductSection";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { baseUrl } from "@/types/baseUrl";
import { notFound } from "next/navigation";
import Script from "next/script";

export default async function PageSlug({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);
  const products = await getAllProducts();
  const id = product.data?.parent_product_id || product.data?.id;
  if (!id) {
    notFound();
  }
  const productDetails = await getProductDetailsById(id);

  if (!product.data || !products.data) return <h1>Prodotto non trovato</h1>;

  const productUrl = `${baseUrl}/catalogo/${product.data?.category_slug}/${product.data?.brand_slug}/${product.data?.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.data?.name,
    image: product.data?.imgSrc,
    description: product.data?.nameFull,
    sku: product.data?.id,
    brand: {
      "@type": "Brand",
      name: product.data?.brand_slug,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: product.data?.price,
      availability: product.data?.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },

    ...(product.data?.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.data.rating,
        reviewCount: productDetails?.characteristics_valutazione?.length ?? 0,
      },
    }),

    review:
      productDetails?.characteristics_valutazione?.map((r) => ({
        "@type": "Review",
        author: r.client_name,
        reviewBody: r.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
        },
      })) || [],
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Catalogo",
        item: `${baseUrl}/catalogo`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.data?.category_slug,
        item: `${baseUrl}/catalogo/${product.data?.category_slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.data?.brand_slug,
        item: `${baseUrl}/catalogo/${product.data?.category_slug}/${product.data?.brand_slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.data?.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs
        category={product?.data?.category_slug}
        brand={product?.data?.brand_slug}
        productName={product?.data?.name}
      />
      {product && <VisualProductSection product={product.data} />}
      {productDetails && product && (
        <ProductCharacteristicsSection product={product.data} productDetail={productDetails} />
      )}
      <ProductRowListSection
        title="Acquistati insieme"
        productsList={products.data}
        idSection="page_product_insieme"
        isBottomLink={false}
      />
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <Script
        id="product-breadcrumbs-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsJsonLd),
        }}
      />
    </>
  );
}
