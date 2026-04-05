"use client";

import StarsRating from "../../StarsRating";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import styles from "./style.module.css";
import SmartImage from "@/components/SmartImage";
import PricesBox from "../../PricesBox";
import ProductQuantityInputButtons from "../../ProductQuantityInputButtons";
import { useCalcTotalSum } from "@/utils/useCalcTotalSum";
import ButtonAddToBasket from "../../ButtonAddToBasket";
import { useBasketStore } from "@/store/basket-store";
import InfoPopupAddedToBasket from "@/components/InfoPopupAddedToBasket";
import { ProductType } from "@/db/schemas/product.schema";

const NUMBER_OF_VARIANTS_TO_SHOW = 2;

type SelectedProduct = ProductType & { qnt: number };

export default function SelectProductSection({
  product,
  variantsProduct,
}: {
  product: ProductType;
  variantsProduct: ProductType[] | null;
}) {
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(() => {
    const fallback = variantsProduct?.find((item) => item.id === product.id) ?? variantsProduct?.[0] ?? product;
    return { ...fallback, qnt: 1 };
  });
  const [variantsToShow, setVariantsToShow] = useState(NUMBER_OF_VARIANTS_TO_SHOW);

  const { updateBasket, showPopup } = useBasketStore();

  const handleAddToCart = () => {
    if (!selectedProduct?.id) return;
    updateBasket([{ productId: selectedProduct.id, quantity: selectedProduct.qnt }]);
    showPopup(selectedProduct.qnt);
  };

  const totalPrice = useCalcTotalSum([
    { qnt: selectedProduct?.qnt ?? 1, price: selectedProduct?.price ?? "0" },
  ]);
  const totalOldPrice = useCalcTotalSum([
    { qnt: selectedProduct?.qnt ?? 1, price: selectedProduct?.oldPrice ?? "0" },
  ]);

  const uiProduct = selectedProduct ?? product;
  const variantGroupSourceId = product.parent_product_id ?? product.id;
  const variantGroupName = `product-page-variant-${variantGroupSourceId}-${product.id}`;

  const shouldShowVariants = (variantsProduct?.length ?? 0) > 1;

  useEffect(() => {
    const fallback =
      variantsProduct?.find((item) => item.id === product.id) ?? variantsProduct?.[0] ?? product;
    setSelectedProduct({ ...fallback, qnt: 1 });
    setVariantsToShow(NUMBER_OF_VARIANTS_TO_SHOW);
  }, [product.id, product.parent_product_id, variantsProduct]);

  return (
    <section className="w-full rounded-sm bg-background p-3 xl:flex-1">
      <header>
        <h1 className="H3 line-clamp-2">{uiProduct.name}</h1>
        {uiProduct.ean ? <p className="helper_text mt-1 text-text-grey">EAN: {uiProduct.ean}</p> : null}
        <StarsRating rating={uiProduct.rating} className="mt-2 justify-end" />
      </header>

      {shouldShowVariants && (
        <>
          {variantsProduct ? (
            <>
              <fieldset
                key={`${variantGroupName}-${selectedProduct?.id ?? "none"}`}
                className="mt-6 flex flex-col gap-3"
              >
                <legend className="input_M_18 mb-3 text-white">Scegli una versione</legend>

                {variantsProduct.slice(0, variantsToShow).map((variant) => {
                  const checked = selectedProduct?.id === variant.id;

                  return (
                    <label
                      key={variant.id}
                      className={twMerge("body_R_20 p-3", styles.label_variant)}
                    >
                      <input
                        type="radio"
                        name={variantGroupName}
                        value={variant.id}
                        checked={checked}
                        onChange={() => setSelectedProduct({ ...variant, qnt: 1 })}
                      />

                      <SmartImage
                        src={variant.imgSrc || "/logo.svg"}
                        alt={variant.name}
                        width={80}
                        height={80}
                        className="h-10 w-10 object-contain object-center lg:h-20 lg:w-20"
                      />

                      <span className="pointer-events-none line-clamp-1">{variant.name}</span>

                      <PricesBox
                        oldPrice={variant.oldPrice}
                        place="dialog-cart-product-variant"
                        price={variant.price}
                        className="pointer-events-none ml-auto flex-col"
                      />
                    </label>
                  );
                })}
              </fieldset>

              <button
                type="button"
                aria-label="Apri altri versioni"
                className={twMerge(
                  "input_M_18 mt-3 mr-0 ml-auto flex text-white underline",
                  variantsToShow >= (variantsProduct?.length || 0) && "hidden",
                )}
                onClick={() => setVariantsToShow((prev) => prev + NUMBER_OF_VARIANTS_TO_SHOW)}
              >
                Apri piu
              </button>
            </>
          ) : null}
        </>
      )}

      <div className="mt-4 flex flex-col gap-5">
        <PricesBox price={totalPrice} oldPrice={totalOldPrice} place="dialog-cart-product-footer" />

        <ProductQuantityInputButtons
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />
      </div>

      <div className="flex gap-3">
        <ButtonAddToBasket
          disabled={!selectedProduct || selectedProduct.inStock <= 0}
          className="mt-4 mb-auto w-full justify-center xl:w-fit"
          onClick={handleAddToCart}
        />
        <InfoPopupAddedToBasket className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 xl:static xl:top-0 xl:left-0 xl:translate-0" />
      </div>
    </section>
  );
}

