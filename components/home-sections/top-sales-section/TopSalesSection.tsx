import Script from "next/script";

import { getTopSalesProducts } from "@/app/actions/product/get-top-sales-products";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { ProductType } from "@/db/schemas/product.schema";
import { baseUrl } from "@/types/baseUrl";

function getProductUrl(product: ProductType) {
  const category = encodeURIComponent(product.category_slug);
  const brand = encodeURIComponent(product.brand_slug);
  const slug = encodeURIComponent(product.slug);

  if (product.productType === "bundle") {
    return `${baseUrl}/catalogo/${category}/${brand}/bundle/${slug}`;
  }

  return `${baseUrl}/catalogo/${category}/${brand}/${slug}`;
}

export default async function TopSalesSection() {
  const initialProducts = await getTopSalesProducts();

  if (initialProducts.length === 0) {
    return (
      <ProductRowListSection
        title="Piu venduto"
        productsList={initialProducts}
        idSection="top_sales_section"
        isBottomLink={true}
      />
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: `${baseUrl}/#top_sales_section`,
    name: "Piu venduto - Prodotti popolari",
    description:
      "Scopri i prodotti piu venduti di OnSmart: sistemi di videosorveglianza, accessori e dispositivi smart per la sicurezza domestica.",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: initialProducts.length,
    itemListElement: initialProducts.map((product, index) => {
      const url = getProductUrl(product);
      const image = product.imgSrc.startsWith("https") ? product.imgSrc : `${baseUrl}${product.imgSrc}`;

      return {
        "@type": "ListItem",
        position: index + 1,
        url,
        item: {
          "@type": "Product",
          name: product.name,
          sku: product.id,
          image,
          brand: {
            "@type": "Brand",
            name: product.brand_slug || "OnSmart",
          },
          description: product.nameFull,
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "EUR",
            price: product.price,
            availability:
              product.inStock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        },
      };
    }),
  };

  return (
    <>
      <ProductRowListSection
        title="Piu venduto"
        productsList={initialProducts}
        idSection="top_sales_section"
        isBottomLink={true}
      />

      <Script
        id="top-sales-section-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
