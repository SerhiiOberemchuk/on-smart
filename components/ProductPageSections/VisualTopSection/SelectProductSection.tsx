"use client";

import StarsRating from "../../StarsRating";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import styles from "./style.module.css";
import Image from "next/image";
import PricesBox from "../../PricesBox";
import ProductQuantityInputButtons from "../../ProductQuantityInputButtons";
import { useCalcTotalSum } from "@/utils/useCalcTotalSum";
import ButtonAddToBasket from "../../ButtonAddToBasket";
import { useBasketStore } from "@/store/basket-store";
import InfoPopupAddedToBasket from "@/components/InfoPopupAddedToBasket";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
import { ProductType } from "@/db/schemas/product.schema";
import { getProductById } from "@/app/actions/product/get-product-by-id";

const NUMBER_OF_VARIANTS_TO_SHOW = 2;

type SelectedProduct = ProductType & { qnt: number };

export default function SelectProductSection({ product }: { product: ProductType }) {
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [variantsToShow, setVariantsToShow] = useState(NUMBER_OF_VARIANTS_TO_SHOW);
  const [variantsProduct, setVariantsProduct] = useState<ProductType[] | null>(null);

  const { updateBasket, showPopup } = useBasketStore();

  const handleAddToCart = () => {
    if (!selectedProduct?.id) return;
    updateBasket([{ id: selectedProduct.id, qnt: selectedProduct.qnt }]);
    showPopup(selectedProduct.qnt);
  };

  const totalPrice = useCalcTotalSum([
    { qnt: selectedProduct?.qnt ?? 1, price: selectedProduct?.price ?? "0" },
  ]);
  const totalOldPrice = useCalcTotalSum([
    { qnt: selectedProduct?.qnt ?? 1, price: selectedProduct?.oldPrice ?? "0" },
  ]);

  const uiProduct = selectedProduct ?? product;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (product.parent_product_id && product.parent_product_id !== "NULL") {
          const resParent = await getProductById(product.parent_product_id);
          const parent = resParent.data;

          if (!alive) return;

          if (parent) {
            const ids = Array.from(new Set([...(parent.variants ?? []), parent.id]));

            if (ids.length) {
              const res = await getProductsByIds(ids);
              if (!alive) return;

              const list = (res.data ?? []) as ProductType[];
              setVariantsProduct(list);

              const fallback = list.find((p) => p.id === product.id) ?? list[0] ?? null;

              if (fallback) setSelectedProduct({ ...fallback, qnt: 1 });
              return;
            }
          }

          setSelectedProduct({ ...product, qnt: 1 });
          return;
        }
        if (!product.variants || product.variants.length === 0) {
          setSelectedProduct({ ...product, qnt: 1 });
          setVariantsProduct(null);
          return;
        }

        const ids = Array.from(new Set([...(product.variants ?? []), product.id]));
        const res = await getProductsByIds(ids);
        if (!alive) return;

        const list = (res.data ?? []) as ProductType[];
        setVariantsProduct(list);

        const fallback = list.find((p) => p.id === product.id) ?? list[0] ?? null;
        if (fallback) setSelectedProduct({ ...fallback, qnt: 1 });
      } catch (error) {
        console.error("Error fetching variants:", error);

        if (alive) setSelectedProduct({ ...product, qnt: 1 });
      }
    })();

    return () => {
      alive = false;
    };
  }, [product]);

  const shouldShowVariants = (variantsProduct?.length ?? 0) > 1;

  return (
    <section className="w-full rounded-sm bg-background p-3 xl:flex-1">
      <header>
        <h2 className="H3 line-clamp-2">{uiProduct.name}</h2>
        <StarsRating rating={uiProduct.rating} className="mt-2 justify-end" />
      </header>

      {shouldShowVariants && (
        <>
          {variantsProduct ? (
            <>
              <fieldset className="mt-6 flex flex-col gap-3">
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
                        name="ProductVariant"
                        value={variant.id}
                        checked={checked}
                        onChange={() => setSelectedProduct({ ...variant, qnt: 1 })}
                      />

                      <Image
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
          ) : (
            <div className="h-auto w-full animate-pulse bg-stroke-grey">
              Caricamento versioni...
            </div>
          )}
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
