import { twMerge } from "tailwind-merge";

import CardProduct from "@/components/ProductCard/CardProduct";
import styles from "./product-catalogo.module.css";
import { ProductType } from "@/db/schemas/product.schema";
import CatalogPagination from "./CatalogPagination";
import ResetCatalogFiltersButton from "../FiltersSection/ResetCatalogFiltersButton";

export default function CatalogProductSection({
  className,
  products,
  page,
  totalPages,
  showResetButtonOnEmpty,
}: {
  className?: string;
  products: ProductType[];
  page: number;
  totalPages: number;
  showResetButtonOnEmpty: boolean;
}) {
  return (
    <section id="products" className={twMerge("flex-1", className)}>
      {products.length > 0 ? (
        <ul className={styles.list}>
          {products.map((product) => (
            <li key={product.id}>
              <CardProduct {...product} className={styles.card} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-sm border border-stroke-grey p-4">
          <p className="body_R_20 text-text-grey">
            Nessun prodotto trovato con i filtri selezionati.
          </p>
          {showResetButtonOnEmpty && <ResetCatalogFiltersButton className="mx-0 pt-3 pb-0" />}
        </div>
      )}
      <CatalogPagination page={page} totalPages={totalPages} />
    </section>
  );
}
