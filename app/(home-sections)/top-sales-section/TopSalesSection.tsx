import Script from "next/script";
import { baseUrl } from "@/types/baseUrl";

import { getTopSalesProducts } from "@/app/actions/get-top-sales-products/action";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";

export default async function TopSalesSection() {
  const initialProducts = await getTopSalesProducts();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Più venduto - Prodotti più popolari",
    description:
      "Scopri i prodotti più venduti di OnSmart: sistemi di videosorveglianza, accessori e dispositivi smart per la sicurezza domestica.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: initialProducts.length,
    itemListElement: initialProducts.map((p, i) => ({
      "@type": "Product",
      position: i + 1,
      name: p.name,
      image: p.imgSrc.startsWith("https") ? p.imgSrc : `${baseUrl}${p.imgSrc}`,
      brand: {
        "@type": "Brand",
        name: p.brand ?? "OnSmart",
      },
      description: p.description,
      offers: {
        "@type": "Offer",
        url: `${baseUrl}/catalogo/${encodeURIComponent(
          p.category,
        )}/${encodeURIComponent(p.brand)}/${p.id}`,
        priceCurrency: "EUR",
        price: p.price,
        availability: "https://schema.org/InStock",
      },
    })),
  };
  return (
    <>
      <ProductRowListSection
        title="Più venduto"
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
