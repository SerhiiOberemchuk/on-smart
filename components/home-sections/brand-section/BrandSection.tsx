import LinkYellow from "@/components/YellowLink";

import { Suspense } from "react";
import { getAllBrands } from "@/app/actions/brands/brand-actions";
import ListBrends from "./ListBrends";

export default function BrandSection() {
  const brands = getAllBrands();

  return (
    <section id="brand-section" className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 className="H2">I brand che trattiamo</h2>
          <p className="sr-only">
            Scopri i marchi leader nella videosorveglianza e sicurezza trattati da OnSmart: Ajax,
            Dahua, Uniview, Ezviz, Hilook e molti altri.
          </p>
          <LinkYellow href="/catalogo" className="hidden md:flex" title="Tutti i prodotti" />
        </div>
      </header>
      <div className="container">
        <Suspense fallback={<p>Caricamento brand...</p>}>
          <ListBrends props={brands} />
        </Suspense>
      </div>
      <LinkYellow href="/catalogo" className="mx-auto flex md:hidden" title="Tutti i prodotti" />
    </section>
  );
}
