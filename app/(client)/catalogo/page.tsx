import ListFiltereOptions from "@/components/PageCatalogComponents/FiltersSection/ListFilterOptions";
import MobileFilterSection from "@/components/PageCatalogComponents/FiltersSection/MobileFilterSection";
import HeaderCatalogo from "@/components/PageCatalogComponents/HeaderCatalogo";
import CatalogProductSection from "@/components/PageCatalogComponents/ProductSection/CatalogProductSection";
import { getCatalogFilters } from "@/lib/get-catalog-filters";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";
import { Metadata } from "next/types";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Catalogo prodotti – Videosorveglianza, Antifurti, Smart Home | OnSmart",
  description:
    "Sfoglia il catalogo completo OnSmart: sistemi di videosorveglianza, antifurti, sensori, domotica, accessori e prodotti professionali per la sicurezza.",
  keywords: [
    "videosorveglianza",
    "antifurto",
    "telecamere sicurezza",
    "dahua",
    "ajax",
    "uniview",
    "domotica",
    "sicurezza casa",
    "on smart",
  ],
  alternates: { canonical: `${baseUrl}/catalogo` },
  openGraph: {
    title: "Catalogo prodotti OnSmart",
    description:
      "Esplora tutti i prodotti disponibili: videosorveglianza, antifurti, smart home e accessori professionali.",
    url: `${baseUrl}/catalogo`,
    type: "website",
    siteName: "OnSmart",
    images: [
      {
        url: `${baseUrl}/og-catalogo.png`,
        width: 1200,
        height: 630,
        alt: "Catalogo prodotti OnSmart",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    noarchive: false,
  },
};
export default function CatalogoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catalogo prodotti OnSmart",
    description:
      "Catalogo completo di prodotti per videosorveglianza, domotica, sicurezza e smart home.",
    url: `${baseUrl}/catalogo`,
    hasPart: [
      {
        "@type": "WebPage",
        name: "Filtri catalogo",
        url: `${baseUrl}/catalogo#filters`,
      },
      {
        "@type": "WebPage",
        name: "Lista prodotti",
        url: `${baseUrl}/catalogo#products`,
      },
    ],
  };
  const filters = getCatalogFilters();
  return (
    <section className="pb-5 lg:pb-16">
      <Suspense fallback={<p>Caricamento...</p>}>
        <HeaderCatalogo />
      </Suspense>

      <div className="xl:bg-background">
        <Suspense fallback={<p>Caricamento...</p>}>
          <MobileFilterSection filtersAction={filters} />
        </Suspense>

        <div className="container flex flex-col gap-5 lg:flex-row">
          <Suspense fallback={<p>Carico...</p>}>
            <ListFiltereOptions className="hidden lg:flex" filtersAction={filters} />
          </Suspense>

          <Suspense fallback={<p>Caricamento...</p>}>
            <CatalogProductSection />
          </Suspense>
        </div>
      </div>
      <Script
        id="catalogo-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
