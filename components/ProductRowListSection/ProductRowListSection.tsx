import { Suspense } from "react";
import ButtonsScrollSwiper from "../ButtonsScrollSwiper";
import LinkYellow from "../YellowLink";
import ProductsList from "./ProductList/ProductsList";
import { Product } from "@/types/product.types";

export type ProductRowListSectionProps = {
  productsList: Product[];
  idSection: string;
  title: string;
  isBottomLink?: boolean;
};

export default function ProductRowListSection({
  productsList,
  idSection,
  title,
  isBottomLink,
}: ProductRowListSectionProps) {
  return (
    <section id={idSection} className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16">
      <div className="bg-background">
        <div className="container flex items-center justify-between py-3">
          <h2 className="H2">{title}</h2>
          <p className="sr-only">
            Esplora i prodotti più venduti di OnSmart: articoli scelti dai nostri clienti, in pronta
            consegna.
          </p>

          <ButtonsScrollSwiper
            className="hidden md:flex"
            idNext={`${idSection}_slider_next`}
            idPrev={`${idSection}_slider_prev`}
          />
        </div>
      </div>
      <Suspense>
        <ProductsList initialProducts={productsList} idSection={idSection} />
      </Suspense>
      {isBottomLink && (
        <LinkYellow href="/catalogo" title="Vai allo shop" className="mx-auto flex w-fit" />
      )}
    </section>
  );
}
