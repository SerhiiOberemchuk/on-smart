import ButtonsScrollSwiper from "../ButtonsScrollSwiper";
import LinkYellow from "../YellowLink";
import ProductsList from "./ProductList/ProductsList";
import { ProductType } from "@/db/schemas/product.schema";

export type ProductRowListSectionProps = {
  productsList: ProductType[];
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
  const headingId = `${idSection}_heading`;

  return (
    <section
      id={idSection}
      aria-labelledby={headingId}
      className="flex flex-col gap-4 py-8 xl:gap-8 xl:py-16"
    >
      <div className="bg-background">
        <div className="container flex items-center justify-between py-3">
          <h2 id={headingId} className="H2">
            {title}
          </h2>
          <p className="sr-only">
            Esplora i prodotti piu venduti di OnSmart: articoli scelti dai nostri clienti, in pronta
            consegna.
          </p>

          <ButtonsScrollSwiper
            className="hidden md:flex"
            idNext={`${idSection}_slider_next`}
            idPrev={`${idSection}_slider_prev`}
          />
        </div>
      </div>
      <ProductsList initialProducts={productsList} idSection={idSection} />
      {isBottomLink && (
        <LinkYellow
          href="/catalogo"
          title="Vai al catalogo completo"
          ariaLabel="Apri il catalogo completo dei prodotti OnSmart"
          className="mx-auto flex w-fit"
        />
      )}
    </section>
  );
}
