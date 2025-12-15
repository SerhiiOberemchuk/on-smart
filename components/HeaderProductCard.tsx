import { ProductType } from "@/db/schemas/product.schema";
// import ButtonComparison from "./ProductCard/card-components/ButtonComparison";
import { twMerge } from "tailwind-merge";

export default function HeaderProductCard({
  oldPrice,
  inStock,
  // id,
  className,
}: Pick<ProductType, "id" | "oldPrice" | "inStock"> & { className?: string }) {
  return (
    <header
      className={twMerge(
        "absolute top-0 right-0 left-0 z-2 flex items-center px-1 md:px-2 xl:px-3",
        className,
      )}
    >
      {oldPrice && <span className="helper_XXS mr-2 bg-offerta-color px-2 py-1">offerta</span>}
      {!inStock && <span className="helper_XXS bg-blue px-2 py-1">in arrivo</span>}
      {/* <ButtonComparison id={id} /> */}
    </header>
  );
}
