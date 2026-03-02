import { Suspense } from "react";

import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import LinkYellow from "@/components/YellowLink";

import CategoryListFallback from "./CategoryListFallback";
import ListCategories from "./ListCategories";

export default function CategorySection() {
  const categoriesPromise = getAllCategoryProducts().catch((error) => {
    console.error("[CategorySection]", error);
    return { success: false, data: [], error };
  });
  const headingId = "category-section-heading";

  return (
    <section
      id="category-section"
      aria-labelledby={headingId}
      className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16"
    >
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 id={headingId} className="H2">
            Esplora per Categoria
          </h2>
          <LinkYellow
            href="/catalogo"
            className="hidden md:flex"
            title="Tutte le categorie"
            ariaLabel="Apri il catalogo con tutte le categorie di prodotto"
          />
        </div>
        <p className="sr-only">
          Esplora le categorie principali dei nostri prodotti di sicurezza, videosorveglianza e
          smart home.
        </p>
      </header>
      <div className="container">
        <Suspense fallback={<CategoryListFallback />}>
          <ListCategories categories={categoriesPromise} />
        </Suspense>
      </div>
      <LinkYellow
        href="/catalogo"
        className="mx-auto flex md:hidden"
        title="Tutte le categorie"
        ariaLabel="Apri il catalogo con tutte le categorie di prodotto"
      />
    </section>
  );
}
