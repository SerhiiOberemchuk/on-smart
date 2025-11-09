"use client";

import { useEffect, useState } from "react";
import { useCardDialogStore } from "./store/card-dialog-store";
import Image from "next/image";
import iconBack from "@/assets/icons/arrow_back.svg";
import iconClose from "@/assets/icons/icon-close.svg";
import iconCart from "@/assets/icons/carrello.svg";
import styles from "./style.module.css";
import clsx from "clsx";
import { DialogProductCard } from "./components/DialogProductCard";
import PricesBox from "@/components/PricesBox";
import { Product } from "@/types/product.types";
import { twMerge } from "tailwind-merge";
import { getProductsByIds } from "@/app/actions/get-products-by-array-ids/action";
import { getSupportProductById } from "@/app/actions/get-support-product-by-id/action";
import checkboxIconChecked from "@/assets/icons/checkbox.svg";
import checkboxIcon from "@/assets/icons/checkbox-non.svg";

const NUMBER_OF_VARIANTS_TO_SHOW = 2;

export default function CardDialog() {
  const { isOpenDialog, product, closeDialog } = useCardDialogStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSupportProducts, setSelectedSupportProducts] = useState<Product[] | null>(null);
  const [supportProducts, setSupportProducts] = useState<Product[] | null>(null);
  const [variants, setVariants] = useState<Product[] | null>(null);
  const [variantsToShow, setVariantsToShow] = useState(NUMBER_OF_VARIANTS_TO_SHOW);
  const [productQuantityAddToCart, setProductQuantityAddToCart] = useState<number>(1);

  useEffect(() => {
    queueMicrotask(() => setSelectedProduct(product));
    if (!product?.variants || product.variants.length === 0) {
      return;
    }

    const fetchVariants = async () => {
      try {
        if (product?.variants?.length === 0 || !product?.variants || product.variants === undefined)
          return;
        const variantsData = await getProductsByIds([{ id: product.id }, ...product.variants]);
        if (variantsData && variantsData.length > 0) {
          setVariants(variantsData as Product[]);
        }
      } catch (error) {
        console.error({ error });
      }
    };
    fetchVariants();
  }, [product]);
  useEffect(() => {
    const fetchSupportProducts = async () => {
      try {
        if (!product?.id) return;
        const supportProductsData = await getSupportProductById(product.id);
        if (supportProductsData && supportProductsData.length > 0) {
          setSupportProducts(supportProductsData as Product[]);
        }
      } catch (error) {
        console.error({ error });
      }
    };
    fetchSupportProducts();
  }, [product]);

  useEffect(() => {
    if (isOpenDialog) {
      document.body.style.overflow = "hidden";
    } else {
      queueMicrotask(() => {
        setSelectedProduct(null);
        setVariants(null);
        setVariantsToShow(NUMBER_OF_VARIANTS_TO_SHOW);
        setProductQuantityAddToCart(1);
        setSupportProducts(null);
        document.body.style.overflow = "auto";
      });
    }
  }, [isOpenDialog]);
  if (!isOpenDialog) return null;
  return (
    <div
      aria-modal={isOpenDialog}
      className="fixed top-0 right-0 bottom-0 left-0 z-1000 bg-black/50"
      id={product?.id}
    >
      <div className="fixed top-0 right-0 bottom-0 left-0 overflow-x-hidden" onClick={closeDialog}>
        <div
          className={clsx(
            "ml-auto flex h-svh w-full max-w-[1110px] flex-col xl:max-h-[780px]",
            styles.card_dialog_content,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between bg-background px-4 py-5 lg:px-10">
            <button
              type="button"
              className="flex items-center gap-2.5 text-white"
              onClick={closeDialog}
            >
              <Image src={iconBack} alt="Pulsante indietro" aria-hidden />
              <span className="H5">Indietro</span>
            </button>
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-sm border border-yellow-500 p-2.5 xl:hidden"
            >
              <Image src={iconClose} aria-hidden alt="Pulsante chiudre" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-2 overflow-y-scroll bg-black py-3 lg:p-5 xl:max-h-[680px] xl:flex-row">
            {product && (
              <DialogProductCard
                logo={product.logo || "/logo.svg"}
                price={product.price}
                images={product.images || []}
                inStock={product.inStock}
                oldPrice={product.oldPrice}
                name={product.name}
              />
            )}

            <div className="min-h-fit flex-1 bg-background px-4 py-3 xl:px-3">
              <h2 className="H3 text-white">{selectedProduct?.name}</h2>
              <div id="product`s variants" className="mt-4 flex flex-col gap-3 xl:mt-6">
                {product?.variants && product.variants.length > 0 && (
                  <>
                    {variants && variants.length > 0 ? (
                      <>
                        <fieldset className="flex flex-col gap-3">
                          <legend className="input_M_18 mb-3 text-white">
                            Scegli una versione
                          </legend>
                          {variants?.slice(0, variantsToShow).map((variant) => {
                            return (
                              <label
                                key={variant.id}
                                // htmlFor={variant.id}
                                className={twMerge(
                                  "body_R_20 ml-1 p-3 xl:ml-4",
                                  styles.label_variant,
                                )}
                                // onClick={() => console.log("variant", variant)}
                              >
                                <input
                                  disabled={variant.inStock === 0}
                                  type="radio"
                                  // id={variant.id}
                                  name="Product variant"
                                  value={variant.id}
                                  checked={selectedProduct?.id === variant.id}
                                  onChange={() => {
                                    setSelectedProduct(variant);
                                  }}
                                  className="sr-only"
                                />
                                <Image
                                  src={variant.imgSrc || variant.images?.[0] || "/logo.svg"}
                                  alt={variant.name}
                                  width={80}
                                  height={80}
                                  className="h-10 w-10 object-contain object-center lg:h-20 lg:w-20"
                                />
                                <span className="pointer-events-none line-clamp-1">
                                  {variant.name}
                                </span>
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
                            "input_M_18 ml-auto text-white underline",
                            variantsToShow >= (variants?.length || 0) && "hidden",
                          )}
                          onClick={() =>
                            setVariantsToShow((prev) => prev + NUMBER_OF_VARIANTS_TO_SHOW)
                          }
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
                <div className={twMerge("flex flex-col justify-start gap-3")}>
                  <span className="input_M_18 text-white">Quantita</span>
                  <div className="flex h-11 w-[132px] items-center rounded-sm border border-stroke-grey text-[20px]">
                    <button
                      type="button"
                      disabled={productQuantityAddToCart <= 1}
                      onClick={() => {
                        setProductQuantityAddToCart((prev) => prev - 1);
                      }}
                      className={twMerge(
                        "flex-1 text-white hover:scale-110",
                        productQuantityAddToCart <= 1 && "cursor-not-allowed opacity-50",
                      )}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={productQuantityAddToCart}
                      min={1}
                      max={selectedProduct?.inStock}
                      onChange={(v) => setProductQuantityAddToCart(Number(v.target.value))}
                      name="quantita"
                      width={44}
                      height={44}
                      className="input_M_18 h-11 w-11 text-center text-white"
                    />

                    <button
                      type="button"
                      className={twMerge(
                        "flex-1 text-white hover:scale-110",
                        productQuantityAddToCart >= (selectedProduct?.inStock || 0) &&
                          "cursor-not-allowed opacity-50",
                      )}
                      disabled={productQuantityAddToCart >= (selectedProduct?.inStock || 0)}
                      onClick={() => {
                        setProductQuantityAddToCart((prev) => prev + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              {supportProducts && (
                <fieldset className="mt-4 flex flex-col gap-3">
                  <legend className="input_M_18 mb-3 text-white">Acquistati insieme</legend>
                  {supportProducts.map((supportProductItem) => (
                    <label
                      key={supportProductItem.id}
                      // htmlFor={supportProductItem.id}
                      className={twMerge("body_R_20 ml-1 p-3 xl:ml-4", styles.label_variant)}
                    >
                      <input
                        disabled={supportProductItem.inStock === 0}
                        type="checkbox"
                        // id={supportProductItem.id}
                        name={supportProductItem?.name}
                        value={supportProductItem.id}
                        // checked={selectedSupportProduct?.id === supportProductItem.id}
                        onChange={() =>
                          setSelectedSupportProducts((prev) => [
                            ...(prev || []),
                            supportProductItem,
                          ])
                        }
                        // checked={
                        //   selectedSupportProducts?.some((p) => p.id === supportProductItem.id) ||
                        //   false
                        // }
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
                        src={
                          supportProductItem.imgSrc || supportProductItem.images?.[0] || "/logo.svg"
                        }
                        alt={supportProductItem.name}
                        width={80}
                        height={80}
                        className="h-10 w-10 object-contain object-center lg:h-20 lg:w-20"
                      />
                      <span className="pointer-events-none line-clamp-1">
                        {supportProductItem.name}
                      </span>
                      <PricesBox
                        oldPrice={supportProductItem.oldPrice}
                        place="dialog-cart-product-variant"
                        price={supportProductItem.price}
                        className="pointer-events-none ml-auto flex-col"
                      />
                    </label>
                  ))}
                </fieldset>
              )}
            </div>
          </div>
          <div className="bg-background p-4">
            <div className="ml-auto flex w-full max-w-[618px] justify-between">
              <PricesBox
                totaleTitle={true}
                place="dialog-cart-product-footer"
                price={
                  selectedProduct?.price ? selectedProduct.price * productQuantityAddToCart : 0
                }
                oldPrice={
                  selectedProduct?.oldPrice
                    ? selectedProduct.oldPrice * productQuantityAddToCart
                    : 0
                }
              />
              <button
                type="button"
                disabled={!selectedProduct?.inStock}
                className={twMerge(
                  "btn flex items-center gap-2 rounded-sm bg-green px-4 py-3 text-white",
                  !selectedProduct?.inStock && "cursor-not-allowed opacity-50",
                )}
                onClick={() => console.log({ product })}
              >
                <Image src={iconCart} alt="Pulsante aggiungi" />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
