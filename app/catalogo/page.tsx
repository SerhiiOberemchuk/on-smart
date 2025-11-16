// import Breadcrumbs from "@/components/Breadcrumbs";

import ListFiltereOptions from "@/components/PageCatalogComponents/FiltersSection/ListFilterOptions";
import MobileFilterSection from "@/components/PageCatalogComponents/FiltersSection/MobileFilterSection";
import CatalogProductSection from "@/components/PageCatalogComponents/ProductSection/CatalogProductSection";
import { Suspense } from "react";

export default function CatalogoPage() {
  return (
    <section className="pb-5 lg:pb-16">
      {/* <Breadcrumbs /> */}
      <header className="bg-background">
        <div className="helper_text container flex w-full items-center justify-between py-3 text-text-grey">
          <span>97 prodotti</span>
          <div className="flex items-center gap-2">
            <span>Ordina per:</span>
            <select
              name="select"
              id="select"
              className="input_R_18 h-9 rounded-sm border border-grey-hover-stroke px-3"
            >
              <option value="new">Novita</option>
              <option value="price-asc">Prezzo più alto</option>
              <option value="price-desc">Prezzo più basso</option>
            </select>
          </div>
        </div>
      </header>
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
