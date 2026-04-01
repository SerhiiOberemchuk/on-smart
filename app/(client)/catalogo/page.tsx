import { getAllProductsFiltered } from "@/app/actions/product/get-all-products-filtered";
import HeaderCatalogo from "@/components/PageCatalogComponents/HeaderCatalogo";
import ListFiltereOptions from "@/components/PageCatalogComponents/FiltersSection/ListFilterOptions";
import MobileFilterSection from "@/components/PageCatalogComponents/FiltersSection/MobileFilterSection";
import CatalogProductSection from "@/components/PageCatalogComponents/ProductSection/CatalogProductSection";
import {
  CatalogDesktopFiltersFallback,
  CatalogHeaderFallback,
  CatalogMobileFiltersFallback,
  CatalogProductsFallback,
} from "@/components/PageCatalogComponents/fallbacks/CatalogPageFallbacks";
import { ProductType } from "@/db/schemas/product.schema";
import {
  buildCatalogPayloadFromSearchParams,
  hasCatalogFiltersApplied,
} from "@/lib/catalog/catalog-query";
import { getCatalogFilters } from "@/lib/get-catalog-filters";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";
import { Metadata } from "next/types";
import { Suspense } from "react";

type CatalogFilterState = {
  isAnyFilterApplied: boolean;
};

export const metadata: Metadata = {
  title: "Catalogo prodotti - Videosorveglianza, Antifurti, Smart Home | OnSmart",
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
    locale: "it_IT",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
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
  twitter: {
    card: "summary_large_image",
    title: "Catalogo prodotti OnSmart",
    description:
      "Esplora tutti i prodotti disponibili: videosorveglianza, antifurti, smart home e accessori professionali.",
    images: [`${baseUrl}/og-image.png`],
  },
};

function buildProductHref(product: ProductType): string {
  if (product.productType === "bundle") {
    return `/catalogo/${product.category_slug}/${product.brand_slug}/bundle/${product.slug}`;
  }

  return `/catalogo/${product.category_slug}/${product.brand_slug}/${product.slug}`;
}

async function getCatalogFilterState({
  filtersAction,
  searchParamsAction,
}: {
  filtersAction: ReturnType<typeof getCatalogFilters>;
  searchParamsAction: PageProps<"/catalogo">["searchParams"];
}): Promise<CatalogFilterState> {
  const [filters, searchParams] = await Promise.all([filtersAction, searchParamsAction]);

  return {
    isAnyFilterApplied: hasCatalogFiltersApplied({
      allFilters: filters,
      searchParams,
    }),
  };
}

async function getCatalogProductsResponse({
  filtersAction,
  searchParamsAction,
}: {
  filtersAction: ReturnType<typeof getCatalogFilters>;
  searchParamsAction: PageProps<"/catalogo">["searchParams"];
}) {
  const [filters, searchParams] = await Promise.all([filtersAction, searchParamsAction]);

  return getAllProductsFiltered(
    buildCatalogPayloadFromSearchParams({
      allFilters: filters,
      searchParams,
    }),
  );
}

async function CatalogHeaderContent({
  productsResponseAction,
}: {
  productsResponseAction: ReturnType<typeof getCatalogProductsResponse>;
}) {
  const productsResponse = await productsResponseAction;
  return <HeaderCatalogo totalProducts={productsResponse.meta.total} />;
}

async function CatalogProductsContent({
  productsResponseAction,
  filterStateAction,
}: {
  productsResponseAction: ReturnType<typeof getCatalogProductsResponse>;
  filterStateAction: Promise<CatalogFilterState>;
}) {
  const [productsResponse, filterState] = await Promise.all([productsResponseAction, filterStateAction]);

  return (
    <CatalogProductSection
      page={productsResponse.meta.page}
      totalPages={productsResponse.meta.totalPages}
      products={productsResponse.data}
      showResetButtonOnEmpty={filterState.isAnyFilterApplied}
    />
  );
}

async function CatalogMobileFiltersContent({
  filtersAction,
}: {
  filtersAction: ReturnType<typeof getCatalogFilters>;
}) {
  const filters = await filtersAction;
  return <MobileFilterSection filters={filters} />;
}

async function CatalogDesktopFiltersContent({
  filtersAction,
}: {
  filtersAction: ReturnType<typeof getCatalogFilters>;
}) {
  const filters = await filtersAction;
  return <ListFiltereOptions className="hidden lg:flex" filters={filters} />;
}

async function CatalogJsonLdContent({
  productsResponseAction,
}: {
  productsResponseAction: ReturnType<typeof getCatalogProductsResponse>;
}) {
  const productsResponse = await productsResponseAction;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catalogo prodotti OnSmart",
    description:
      "Catalogo completo di prodotti per videosorveglianza, domotica, sicurezza e smart home.",
    url: `${baseUrl}/catalogo`,
    inLanguage: "it-IT",
    mainEntity: {
      "@type": "ItemList",
      name: "Lista prodotti catalogo",
      numberOfItems: productsResponse.meta.total,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: productsResponse.data.map((product, index) => ({
        "@type": "ListItem",
        position: (productsResponse.meta.page - 1) * productsResponse.meta.limit + index + 1,
        name: product.nameFull || product.name,
        url: `${baseUrl}${buildProductHref(product)}`,
      })),
    },
  };

  return (
    <Script
      id="catalogo-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function CatalogoContent({
  filtersAction,
  searchParamsAction,
}: {
  filtersAction: ReturnType<typeof getCatalogFilters>;
  searchParamsAction: PageProps<"/catalogo">["searchParams"];
}) {
  const filterStateAction = getCatalogFilterState({
    filtersAction,
    searchParamsAction,
  });
  const productsResponseAction = getCatalogProductsResponse({
    filtersAction,
    searchParamsAction,
  });

  return (
    <>
      <Suspense fallback={<CatalogHeaderFallback />}>
        <CatalogHeaderContent productsResponseAction={productsResponseAction} />
      </Suspense>

      <div id="filters" className="xl:bg-background">
        <Suspense fallback={<CatalogMobileFiltersFallback />}>
          <CatalogMobileFiltersContent filtersAction={filtersAction} />
        </Suspense>

        <div className="container flex flex-col gap-5 lg:flex-row">
          <Suspense fallback={<CatalogDesktopFiltersFallback />}>
            <CatalogDesktopFiltersContent filtersAction={filtersAction} />
          </Suspense>

          <Suspense fallback={<CatalogProductsFallback />}>
            <CatalogProductsContent
              productsResponseAction={productsResponseAction}
              filterStateAction={filterStateAction}
            />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}>
        <CatalogJsonLdContent productsResponseAction={productsResponseAction} />
      </Suspense>
    </>
  );
}

export default function CatalogoPage(props: PageProps<"/catalogo">) {
  const filtersAction = getCatalogFilters();

  return (
    <section className="pb-5 lg:pb-16">
      <h1 className="sr-only">Catalogo prodotti OnSmart</h1>
      <CatalogoContent filtersAction={filtersAction} searchParamsAction={props.searchParams} />
    </section>
  );
}
