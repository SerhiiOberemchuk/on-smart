"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { toast } from "react-toastify";

import icon_dell from "@/assets/icons/icon_delete.svg";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
import type { ProductType } from "@/db/schemas/product.schema";
import { useBasketStore } from "@/store/basket-store";

import Breadcrumbs from "@/components/Breadcrumbs";
import PricesBox from "@/components/PricesBox";
import SmartImage from "@/components/SmartImage";

import HeaderCart from "./HeaderCart";
import RepilogoComponent from "./RepilogoComponent";

export default function CartSection() {
  const [fetchedProducts, setFetchedProducts] = useState<ProductType[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const hasValidatedOnceRef = useRef(false);
  const previousFetchedProductsRef = useRef<ProductType[]>([]);

  const { basket, hasHydrated, removeFromBasketById, updateBasket, setProductsInBasket } =
    useBasketStore();

  useEffect(() => {
    setProductsInBasket(fetchedProducts);
    previousFetchedProductsRef.current = fetchedProducts;
  }, [fetchedProducts, setProductsInBasket]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (basket.length === 0) {
      setFetchedProducts([]);
      setIsLoadingProducts(false);
      hasValidatedOnceRef.current = false;
      return;
    }

    const load = async () => {
      setIsLoadingProducts(true);

      const ids = basket
        .map((item) => item.productId)
        .filter((item): item is string => typeof item === "string");

      const { data, success, errorMessage } = await getProductsByIds(ids, {
        includeOutOfStock: true,
        includeHidden: true,
      });

      if (!success) {
        if (errorMessage) {
          console.error(`[CartSection] ${errorMessage}`);
        }

        toast.error("Errore nel caricamento dei prodotti");
        setIsLoadingProducts(false);
        return;
      }

      const products = data ?? [];
      const productsById = new Map(products.map((product) => [product.id, product]));
      const previousProductsById = new Map(
        previousFetchedProductsRef.current.map((product) => [product.id, product]),
      );

      const missingIds: string[] = [];
      const hiddenIds: string[] = [];
      const unavailableIds: string[] = [];
      const invalidQuantityIds: string[] = [];
      const quantityAdjustedIds: string[] = [];
      const priceChangedIds: string[] = [];
      const idsToRemove = new Set<string>();
      const nextBasketUpdates: { productId: string; quantity: number }[] = [];

      basket.forEach((basketItem) => {
        if (typeof basketItem.productId !== "string") return;

        const product = productsById.get(basketItem.productId);
        if (!product) {
          missingIds.push(basketItem.productId);
          idsToRemove.add(basketItem.productId);
          return;
        }

        if (product.isHidden) {
          hiddenIds.push(product.id);
          idsToRemove.add(product.id);
          return;
        }

        if (!Number.isFinite(basketItem.quantity) || basketItem.quantity <= 0) {
          invalidQuantityIds.push(product.id);
          nextBasketUpdates.push({ productId: product.id, quantity: 1 });
          return;
        }

        if (product.inStock <= 0) {
          unavailableIds.push(product.id);
          idsToRemove.add(product.id);
          return;
        }

        if (basketItem.quantity > product.inStock) {
          quantityAdjustedIds.push(product.id);
          nextBasketUpdates.push({ productId: product.id, quantity: product.inStock });
        }

        const previousProduct = previousProductsById.get(product.id);
        if (
          previousProduct &&
          (Number(previousProduct.price) !== Number(product.price) ||
            Number(previousProduct.oldPrice ?? 0) !== Number(product.oldPrice ?? 0))
        ) {
          priceChangedIds.push(product.id);
        }
      });

      idsToRemove.forEach((id) => removeFromBasketById(id));

      if (nextBasketUpdates.length > 0) {
        updateBasket(nextBasketUpdates);
      }

      if (hasValidatedOnceRef.current) {
        if (missingIds.length > 0) {
          toast.warning(
            "Alcuni prodotti non sono più disponibili e sono stati rimossi dal carrello.",
          );
        }

        if (hiddenIds.length > 0) {
          toast.warning(
            "Alcuni prodotti non sono più presenti nel nostro catalogo e sono stati rimossi dal carrello.",
          );
        }

        if (unavailableIds.length > 0) {
          toast.warning(
            "Alcuni prodotti non sono disponibili per l'ordine e sono stati rimossi dal carrello.",
          );
        }

        if (invalidQuantityIds.length > 0) {
          toast.info("Le quantità non valide sono state corrette.");
        }

        if (quantityAdjustedIds.length > 0) {
          toast.info(
            "Le quantità di alcuni prodotti sono state aggiornate in base alla disponibilità.",
          );
        }

        if (priceChangedIds.length > 0) {
          toast.info("I prezzi di alcuni prodotti sono stati aggiornati.");
        }
      }

      hasValidatedOnceRef.current = true;
      setFetchedProducts(
        products.filter(
          (product) => !idsToRemove.has(product.id) && !product.isHidden && product.inStock > 0,
        ),
      );
      setIsLoadingProducts(false);
    };

    load();
  }, [basket, hasHydrated, removeFromBasketById, updateBasket]);

  const basketById = useMemo(
    () => new Map(basket.map((basketItem) => [basketItem.productId, basketItem])),
    [basket],
  );
  const fetchedProductsById = useMemo(
    () => new Map(fetchedProducts.map((product) => [product.id, product])),
    [fetchedProducts],
  );

  const calcProductPrice = (productId: string) => {
    const item = basketById.get(productId);
    const product = fetchedProductsById.get(productId);

    if (!item || !product) {
      return { price: "0", oldPrice: null };
    }

    return {
      price: (item.quantity * Number(product.price)).toString(),
      oldPrice: product.oldPrice ? (item.quantity * Number(product.oldPrice)).toString() : null,
    };
  };

  const incrementQnt = (productId: string) => {
    const item = basketById.get(productId);
    const product = fetchedProductsById.get(productId);

    if (!item || !product) return;

    if (item.quantity < product.inStock) {
      updateBasket([{ productId, quantity: item.quantity + 1 }]);
      return;
    }

    toast.info("Quantità massima disponibile.");
  };

  const decrementQnt = (productId: string) => {
    const item = basketById.get(productId);

    if (item && item.quantity > 1) {
      updateBasket([{ productId, quantity: item.quantity - 1 }]);
    }
  };

  const calcTotal = () => {
    return fetchedProducts.reduce((acc, product) => {
      const item = basketById.get(product.id);
      if (!item) return acc;
      return acc + item.quantity * Number(product.price);
    }, 0);
  };

  return (
    <section id="carello">
      <Breadcrumbs carello="Carello" />
      <HeaderCart />

      <div className="container bg-background xl:bg-transparent">
        <div className="relative flex flex-col gap-4 xl:mt-5 xl:flex-row xl:gap-5">
          <ul className="mx-auto flex min-h-[320px] w-full max-w-[916px] flex-col gap-6 rounded-sm bg-background p-3 xl:mx-0">
            {(!hasHydrated || isLoadingProducts) &&
              basket.length > 0 &&
              Array.from({ length: Math.min(Math.max(basket.length, 1), 3) }).map((_, index) => (
                <li
                  key={`cart-skeleton-${index}`}
                  className={clsx(
                    "relative flex flex-col gap-3 xl:flex-row xl:gap-5",
                    index !== Math.min(Math.max(basket.length, 1), 3) - 1 &&
                      "border-b border-grey-hover-stroke pb-3 xl:pb-6",
                  )}
                >
                  <div className="card_gradient h-16 w-16 animate-pulse rounded-sm xl:h-[230px] xl:w-60" />
                  <div className="flex w-full flex-col justify-between gap-4">
                    <div className="mt-2 space-y-3">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-grey-hover-stroke" />
                      <div className="h-5 w-5/6 animate-pulse rounded bg-grey-hover-stroke" />
                      <div className="h-5 w-1/2 animate-pulse rounded bg-grey-hover-stroke" />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="h-11 w-[132px] animate-pulse rounded-sm bg-grey-hover-stroke" />
                      <div className="space-y-2">
                        <div className="ml-auto h-5 w-24 animate-pulse rounded bg-grey-hover-stroke" />
                        <div className="ml-auto h-7 w-28 animate-pulse rounded bg-grey-hover-stroke" />
                      </div>
                    </div>
                  </div>
                </li>
              ))}

            {hasHydrated &&
              !isLoadingProducts &&
              fetchedProducts.map((product, index) => {
                const item = basketById.get(product.id);
                const price = calcProductPrice(product.id);
                const canIncrement = item && item.quantity < product.inStock;
                const canDecrement = item && item.quantity > 1;

                return (
                  <li
                    key={product.id}
                    className={clsx(
                      "relative flex flex-col gap-3 xl:flex-row xl:gap-5",
                      index !== fetchedProducts.length - 1 &&
                        "border-b border-grey-hover-stroke pb-3 xl:pb-6",
                    )}
                  >
                    <button
                      onClick={() => removeFromBasketById(product.id)}
                      className="absolute top-0 right-0"
                    >
                      <SmartImage src={icon_dell} alt="delete" />
                    </button>

                    <SmartImage
                      src={product.imgSrc}
                      alt="product"
                      width={230}
                      height={230}
                      className="card_gradient h-auto w-16 rounded-sm object-contain object-left xl:w-60"
                    />

                    <div className="flex w-full flex-col justify-between">
                      <div>
                        <h2 className="input_R_18 mt-2 line-clamp-3 max-w-[412px]">
                          {product.nameFull}
                        </h2>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex h-11 w-[132px] items-center rounded-sm border border-stroke-grey text-[20px]">
                          <button
                            type="button"
                            disabled={!canDecrement}
                            className={clsx(
                              "flex-1 text-white transition hover:scale-110",
                              !canDecrement && "cursor-not-allowed opacity-50",
                            )}
                            onClick={() => canDecrement && decrementQnt(product.id)}
                          >
                            -
                          </button>

                          <div className="input_M_18 flex h-11 w-11 items-center justify-center text-white">
                            {item?.quantity ?? 0}
                          </div>

                          <button
                            type="button"
                            disabled={!canIncrement}
                            className={clsx(
                              "flex-1 text-white transition hover:scale-110",
                              !canIncrement && "cursor-not-allowed opacity-50",
                            )}
                            onClick={() => canIncrement && incrementQnt(product.id)}
                          >
                            +
                          </button>
                        </div>

                        <PricesBox
                          price={price.price}
                          oldPrice={price.oldPrice}
                          place="main-card-product"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}

            {hasHydrated && !isLoadingProducts && basket.length === 0 && (
              <li className="text-center">
                Il carrello è vuoto{" "}
                <Link href="/catalogo" className="underline">
                  Vai al catalogo
                </Link>
              </li>
            )}
          </ul>

          {!hasHydrated || (isLoadingProducts && basket.length > 0) ? (
            <div className="sticky top-5 w-full xl:max-w-[426px]">
              <div className="sticky top-5 flex min-h-[260px] w-full flex-col gap-6 rounded-sm bg-background p-3">
                <div className="h-8 w-2/3 animate-pulse rounded bg-grey-hover-stroke" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`summary-skeleton-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="h-5 w-28 animate-pulse rounded bg-grey-hover-stroke" />
                      <div className="h-5 w-20 animate-pulse rounded bg-grey-hover-stroke" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-7 w-24 animate-pulse rounded bg-grey-hover-stroke" />
                  <div className="h-7 w-24 animate-pulse rounded bg-grey-hover-stroke" />
                </div>
                <div className="h-11 w-full animate-pulse rounded-sm bg-yellow-500/40" />
              </div>
            </div>
          ) : (
            <RepilogoComponent totalPrice={calcTotal()} basket={basket} />
          )}
        </div>
      </div>
    </section>
  );
}
