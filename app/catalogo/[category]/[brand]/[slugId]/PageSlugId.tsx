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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
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
      availability: "https://schema.org/InStock",
    },
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
          __html: JSON.stringify(jsonLd),
        }}
      />
    </>
  );
}
