// import Breadcrumbs from "@/components/Breadcrumbs";
import ListFiltereOptions from "@/components/PageCatalogComponents/FiltersSection/ListFilterOptions";
import MobileFilterSection from "@/components/PageCatalogComponents/FiltersSection/MobileFilterSection";
import HeaderCatalogo from "@/components/PageCatalogComponents/HeaderCatalogo";
import CatalogProductSection from "@/components/PageCatalogComponents/ProductSection/CatalogProductSection";
import { baseUrl } from "@/types/baseUrl";
import { Metadata } from "next/types";
import { Suspense } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: baseUrl + "/catalogo",
  },
};
export default async function CatalogoPage() {
  return (
    <section className="pb-5 lg:pb-16">
      {/* <Breadcrumbs /> */}
      <Suspense>
        <HeaderCatalogo />
      </Suspense>

      <div className="xl:bg-background">
        <Suspense>
          <MobileFilterSection />
        </Suspense>

        <div className="container flex flex-col gap-5 lg:flex-row">
          <Suspense>
            <ListFiltereOptions className="hidden lg:flex" />
          </Suspense>

          <Suspense>
            <CatalogProductSection />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
