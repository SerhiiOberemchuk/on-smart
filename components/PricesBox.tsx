import { Product } from "@/types/product.types";
import { twMerge } from "tailwind-merge";

type Props = Pick<Product, "price" | "oldPrice"> & {
  place: "main-card-product" | "dialog-cart-product-footer" | "dialog-cart-product-card";
  totaleTitle?: boolean;
  className?: string;
};

export default function PricesBox({
  price,
  oldPrice,
  place,
  totaleTitle = false,
  className,
}: Props) {
  return (
    <div className={className}>
      {totaleTitle && <h3 className="input_M_18 text-white">Totale</h3>}
      <div
        className={twMerge(
          "flex",
          place === "dialog-cart-product-footer" && "items-center gap-2 py-2",
          place === "main-card-product" && "flex h-14 flex-col",
          place === "dialog-cart-product-card" && "mx-auto w-fit items-center gap-2 py-2",
        )}
      >
        <span className="H3 text-red">{price.toFixed(2)}€</span>
        {oldPrice && <span className="text-text-grey line-through">{oldPrice.toFixed(2)}€</span>}
      </div>
    </div>
  );
}
