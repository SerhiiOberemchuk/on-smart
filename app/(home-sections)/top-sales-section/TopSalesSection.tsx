import LinkYellow from "@/components/YellowLink";
import ProductsList from "./ProductList/ProductsList";
import Script from "next/script";
import { baseUrl } from "@/types/baseUrl";
import { Suspense } from "react";
import ButtonsScrollSwiper from "@/components/ButtonsScrollSwiper";
import { getTopSalesProducts } from "@/app/actions/get-top-sales-products/action";

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
    <section id="top-sales-section" className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <div className="bg-background">
        <div className="container flex items-center justify-between py-3">
          <h2 className="H2">Più venduto</h2>
          <ButtonsScrollSwiper
            idNext="top_products_list_slider_next"
            idPrev="top_products_list_slider_prev"
          />
        </div>
      </div>
      <Suspense>
        <ProductsList initialProducts={initialProducts} />
      </Suspense>
      <LinkYellow href="/catalogo" title="Vai allo shop" className="mx-auto flex w-fit" />
      <Script
        id="top-sales-section-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
