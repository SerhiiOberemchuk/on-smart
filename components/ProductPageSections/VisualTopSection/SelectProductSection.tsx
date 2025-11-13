"use client";

import { Product } from "@/types/product.types";
import StarsRating from "../../StarsRating";
import { useEffect, useState } from "react";
import { getProductsByIds } from "@/app/actions/get-products-by-array-ids/action";
import { twMerge } from "tailwind-merge";
import styles from "./style.module.css";
import Image from "next/image";
import PricesBox from "../../PricesBox";
import checkboxIconChecked from "@/assets/icons/checkbox.svg";
import checkboxIcon from "@/assets/icons/checkbox-non.svg";
import ProductQuantityInputButtons from "../../ProductQuantityInputButtons";
import { useCalcTotalSum } from "@/utils/useCalcTotalSum";
import ButtonAddToBasket from "../../ButtonAddToBasket";
import { useBasketStore } from "@/store/basket-store";
import InfoPopupAddedToBasket from "@/components/InfoPopupAddedToBasket";
const NUMBER_OF_VARIANTS_TO_SHOW = 2;

export default function SelectProductSection({ product }: { product: Product }) {
  const { name, rating } = product;
  const [selectedProduct, setSelectedProduct] = useState<(Product & { qnt: number }) | null>(null);

  const [variantsToShow, setVariantsToShow] = useState(NUMBER_OF_VARIANTS_TO_SHOW);

  const [variantsProduct, setVariantsProduct] = useState<Product[] | null>(null);

  const { updateBasket, showPopup } = useBasketStore();

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    updateBasket([{ id: selectedProduct.id, qnt: selectedProduct.qnt }]);
    showPopup(selectedProduct.qnt);
  };

  const totalPrice = useCalcTotalSum([
    { qnt: selectedProduct?.qnt || 1, price: selectedProduct?.price || 0 },
  ]);
  const totalOldPrice = useCalcTotalSum([
    { qnt: selectedProduct?.qnt || 1, price: selectedProduct?.oldPrice || 0 },
  ]);

  useEffect(() => {
    const fetchVariants = async () => {
      if (!product.variants || product.variants.length === 0) {
        setSelectedProduct({ ...product, qnt: 1 });
        return;
      }
      try {
        const res = await getProductsByIds(product.variants!);
        if (res && res.length > 0) {
          setVariantsProduct(res as Product[]);
        }
      } catch (error) {
        console.error("Error fetching variant products:", error);
      }
    };
    fetchVariants();
  }, [product]);

  return (
    <section className="w-full rounded-sm bg-background p-3 xl:flex-1">
      <header>
        <h2 className="H3 line-clamp-2">{name}</h2>
        <StarsRating rating={rating} className="mt-2 justify-end" />
      </header>
      {product?.variants && product.variants.length > 0 && (
        <>
          {variantsProduct && variantsProduct.length > 0 ? (
            <>
              <fieldset className="mt-6 flex flex-col gap-3">
                <legend className="input_M_18 mb-3 text-white">Scegli una versione</legend>
                {variantsProduct?.slice(0, variantsToShow).map((variant) => {
                  return (
                    <label
                      key={variant.id}
                      className={twMerge("body_R_20 p-3", styles.label_variant)}
                    >
                      <input
                        disabled={variant.inStock === 0}
                        type="radio"
                        name="Product variant"
                        value={variant.id}
                        checked={selectedProduct?.id === variant.id}
                        onChange={() => {
                          setSelectedProduct({
                            ...variant,
                            qnt: 1,
                          } as Product & { qnt: number });
                        }}
                        className="sr-only"
                      />
                      <div className="mr-1 size-4 shrink-0">
                        <Image
                          src={checkboxIconChecked}
                          className={styles.checked}
                          alt="Checkbox icon"
                          width={16}
                          height={16}
                        />
                        <Image
                          className={styles.check}
                          src={checkboxIcon}
                          alt="Checkbox icon"
                          width={16}
                          height={16}
                        />
                      </div>
                      <Image
                        src={variant.imgSrc || variant.images?.[0] || "/logo.svg"}
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
        {/* {selectedProduct && ( )} */}
        <ProductQuantityInputButtons
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />
      </div>
      <div className="flex gap-3">
        <ButtonAddToBasket
          disabled={!selectedProduct?.inStock}
          className="mt-4 mb-auto w-full justify-center xl:w-fit"
          onClick={handleAddToCart}
        />
        <InfoPopupAddedToBasket className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 xl:static xl:top-0 xl:left-0 xl:translate-0" />
      </div>
    </section>
  );
}
