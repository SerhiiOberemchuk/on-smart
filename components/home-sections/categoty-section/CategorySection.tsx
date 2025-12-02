import LinkYellow from "@/components/YellowLink";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import ListCategories from "./ListCategories";
import { Suspense } from "react";

export default function CategorySection() {
  const data = getAllCategoryProducts();

  return (
    <section id="category-section" className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <header className="bg-background">
        <div className="container flex items-center justify-between py-4">
          <h2 className="H2">Esplora per Categoria</h2>
          <LinkYellow href="/catalogo" className="hidden md:flex" title="Tutti i prodotti" />
        </div>
        <p className="sr-only">
          Esplora le categorie principali dei nostri prodotti di sicurezza, videosorveglianza e
          smart home.
        </p>
      </header>
      <div className="container">
        <Suspense>
          <ListCategories categories={data} />
        </Suspense>
      </div>
      <LinkYellow href="/catalogo" className="mx-auto flex md:hidden" title="Tutti i prodotti" />
    </section>
  );
}
