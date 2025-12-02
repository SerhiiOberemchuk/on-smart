import { getAllProducts } from "@/app/actions/product/get-all-products";
import { getProductById } from "@/app/actions/product/get-product-by-id";
import { getProductDetailsById } from "@/app/actions/product/get-product-details-by-Id";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCharacteristicsSection from "@/components/ProductPageSections/ProductCharacteristicsSection/ProductCharacteristacSection";
import VisualProductSection from "@/components/ProductPageSections/VisualTopSection/VisualProductSection";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";

export default async function PageSlugId({ id }: { id: string }) {
  const product = await getProductById(id);
  const products = await getAllProducts({});
  const productDetails = await getProductDetailsById(id);

  if (!product) return <h1>Prodotto non trovato</h1>;

  const productUrl = `${baseUrl}/catalogo/${product.category}/${product.brand}/${product.name}-${id}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images[0],
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: product.price,
      availability:
        product.inStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },

    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: productDetails?.characteristics_valutazione?.recensioni.length ?? 0,
      },
    }),

    review:
      productDetails?.characteristics_valutazione?.recensioni?.map((r) => ({
        "@type": "Review",
        author: r.clientName,
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
        name: product.category,
        item: `${baseUrl}/catalogo/${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.brand,
        item: `${baseUrl}/catalogo/${product.category}/${product.brand}-${id}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs
        category={product?.category}
        brand={product?.brand}
        productName={product?.name}
      />
      {product && <VisualProductSection product={product} />}
      {productDetails && product && (
        <ProductCharacteristicsSection product={product} productDetail={productDetails} />
      )}
      <ProductRowListSection
        title="Acquistati insieme"
        productsList={products}
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
