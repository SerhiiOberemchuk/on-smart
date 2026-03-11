"use client";

import { useState } from "react";
import ButtonAddToBasket from "@/components/ButtonAddToBasket";
import InfoPopupAddedToBasket from "@/components/InfoPopupAddedToBasket";
import { useBasketStore } from "@/store/basket-store";

export default function BundleAddToCartButton({
  bundleId,
  inStock,
  disabled,
}: {
  bundleId: string;
  inStock: number;
  disabled: boolean;
}) {
  const { updateBasket, showPopup } = useBasketStore();
  const [quantity, setQuantity] = useState(1);
  const canSelectQuantity = inStock > 1;

  const handleAddToCart = () => {
    if (disabled) return;
    updateBasket([{ productId: bundleId, quantity }]);
    showPopup(quantity);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {canSelectQuantity ? (
        <div className="flex h-11 w-[132px] items-center rounded-sm border border-stroke-grey text-[20px]">
          <button
            type="button"
            className="flex-1 text-white hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1 || disabled}
            aria-label="Diminuisci quantita"
          >
            -
          </button>
          <span className="input_M_18 flex h-11 w-11 items-center justify-center text-white">
            {quantity}
          </span>
          <button
            type="button"
            className="flex-1 text-white hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setQuantity((prev) => Math.min(inStock, prev + 1))}
            disabled={quantity >= inStock || disabled}
            aria-label="Aumenta quantita"
          >
            +
          </button>
        </div>
      ) : null}
      <ButtonAddToBasket
        disabled={disabled}
        onClick={handleAddToCart}
        className="w-full justify-center md:w-fit"
      />
      <InfoPopupAddedToBasket className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 xl:static xl:translate-0" />
    </div>
  );
}
