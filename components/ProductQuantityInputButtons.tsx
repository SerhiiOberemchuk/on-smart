"use client";

import { ProductType } from "@/db/schemas/product.schema";
import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ProductQuantityInputButtonsProps = HTMLAttributes<HTMLDivElement> & {
  selectedProduct: (ProductType & { qnt: number }) | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<(ProductType & { qnt: number }) | null>>;
};

export default function ProductQuantityInputButtons({
  selectedProduct,
  setSelectedProduct,
  className,
  ...rest
}: ProductQuantityInputButtonsProps) {
  return (
    <div className={twMerge("flex flex-col justify-start gap-3", className)} {...rest}>
      <span className="input_M_18 text-white">Quantita</span>
      <div className="flex h-11 w-[132px] items-center rounded-sm border border-stroke-grey text-[20px]">
        <button
          type="button"
          disabled={selectedProduct?.qnt ? selectedProduct.qnt <= 1 : true}
          onClick={() => {
            setSelectedProduct((prev) =>
              prev ? { ...prev, qnt: Math.max(1, prev.qnt - 1) } : prev,
            );
          }}
          className={twMerge(
            "flex-1 text-white hover:scale-110",
            (selectedProduct?.qnt ? selectedProduct.qnt <= 1 : true) &&
              "cursor-not-allowed opacity-50",
          )}
        >
          -
        </button>
        <span
          // type="number"
          // value={selectedProduct?.qnt || 1}
          // min={1}
          // max={selectedProduct?.inStock}
          // onChange={(v) =>
          //   setSelectedProduct((prev) => (prev ? { ...prev, qnt: Number(v.target.value) } : prev))
          // }
          // name="quantita"
          // width={44}
          // height={44}
          className="input_M_18 flex h-11 w-11 items-center justify-center text-white"
        >
          {selectedProduct?.qnt || 0}
        </span>

        <button
          type="button"
          className={twMerge(
            "flex-1 text-white hover:scale-110",
            (selectedProduct?.qnt ? selectedProduct.qnt >= selectedProduct?.inStock : true) &&
              "cursor-not-allowed opacity-50",
          )}
          disabled={selectedProduct?.qnt ? selectedProduct.qnt >= selectedProduct.inStock : true}
          onClick={() => {
            setSelectedProduct((prev) => (prev ? { ...prev, qnt: prev.qnt + 1 } : prev));
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
