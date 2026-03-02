import { Suspense } from "react";

import { getAllBrands } from "@/app/actions/brands/brand-actions";
import LinkYellow from "@/components/YellowLink";

import BrandListFallback from "./BrandListFallback";
import ListBrends from "./ListBrends";

export default function BrandSection() {
  const brandsPromise = getAllBrands().catch((error) => {
    console.error("[BrandSection]", error);
    return { success: false, data: [], error };
  });
  const headingId = "brand-section-heading";

  return (
    <section
      id="brand-section"
      aria-labelledby={headingId}
      className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16"
    >
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 id={headingId} className="H2">
            I brand che trattiamo
          </h2>
          <p className="sr-only">
            Scopri i marchi leader nella videosorveglianza e sicurezza trattati da OnSmart: Ajax,
            Dahua, Uniview, Ezviz, Hilook e molti altri.
          </p>
          <LinkYellow
            href="/catalogo"
            className="hidden md:flex"
            title="Tutti i brand"
            ariaLabel="Apri il catalogo con tutti i brand disponibili"
          />
        </div>
      </header>
      <div className="container">
        <Suspense fallback={<BrandListFallback />}>
          <ListBrends props={brandsPromise} />
        </Suspense>
      </div>
      <LinkYellow
        href="/catalogo"
        className="mx-auto flex md:hidden"
        title="Tutti i brand"
        ariaLabel="Apri il catalogo con tutti i brand disponibili"
      />
    </section>
  );
}
