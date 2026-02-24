"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { toast } from "react-toastify";

import Breadcrumbs from "@/components/Breadcrumbs";
import PricesBox from "@/components/PricesBox";
import HeaderCart from "./HeaderCart";
import RepilogoComponent from "./RepilogoComponent";

import icon_dell from "@/assets/icons/icon_delete.svg";

import { useBasketStore } from "@/store/basket-store";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
import type { ProductType } from "@/db/schemas/product.schema";
const btnBase =
  "size-11 flex items-center justify-center rounded-sm border border-stroke-grey transition";

const btnDisabled = "opacity-40 cursor-not-allowed";

const btnActive = "hover:bg-grey-hover cursor-pointer";
export default function CartSection() {
  const [fetchedProducts, setFetchedProducts] = useState<ProductType[]>([]);

  const { basket, removeFromBasketById, updateBasket, setProductsInBasket } = useBasketStore();
  useEffect(() => {
    setProductsInBasket(fetchedProducts);
  }, [fetchedProducts, setProductsInBasket]);
  useEffect(() => {
    if (basket.length === 0) {
      const set = () => setFetchedProducts([]);
      set();
      return;
    }

    const load = async () => {
      const ids = basket.map((item) => item.productId).filter((i) => i !== null);

      const { data, error } = await getProductsByIds(ids);

      if (error) {
        console.error(error);
        toast.error("Errore nel caricamento dei prodotti");
        return;
      }

      const products = data ?? [];

      if (products.length < ids.length) {
        toast.warning("Alcuni prodotti non sono più disponibili.");

        const validIds = new Set(products.map((p) => p.id));
        basket
          .filter((b) => {
            if (typeof b.productId === "string") return !validIds.has(b.productId);
          })
          .forEach((b) => {
            if (typeof b.productId === "string") return removeFromBasketById(b.productId);
          });
      }

      products.forEach((prod) => {
        const item = basket.find((i) => i.productId === prod.id);
        if (!item) return;

        if (item.quantity > prod.inStock) {
          updateBasket([{ productId: prod.id, quantity: prod.inStock }]);
        }
      });

      setFetchedProducts(products);
    };

    load();
  }, [basket, removeFromBasketById, updateBasket]);

  const calcProductPrice = (productId: string) => {
    const item = basket.find((b) => b.productId === productId);
    const prod = fetchedProducts.find((p) => p.id === productId);

    if (!item || !prod) return { price: "0", oldPrice: null };

    return {
      price: (item.quantity * Number(prod.price)).toString(),
      oldPrice: prod.oldPrice ? (item.quantity * Number(prod.oldPrice)).toString() : null,
    };
  };

  const incrementQnt = (productId: string) => {
    const item = basket.find((b) => b.productId === productId);
    const prod = fetchedProducts.find((p) => p.id === productId);

    if (!item || !prod) return;

    if (item.quantity < prod.inStock) {
      updateBasket([{ productId, quantity: item.quantity + 1 }]);
    } else {
      toast.info("Quantità massima disponibile.");
    }
  };

  const decrementQnt = (id: string) => {
    const item = basket.find((b) => b.productId === id);

    if (item && item.quantity > 1) {
      updateBasket([{ productId: id, quantity: item.quantity - 1 }]);
    }
  };

  const calcTotal = () => {
    return fetchedProducts.reduce((acc, prod) => {
      const item = basket.find((b) => b.productId === prod.id);
      if (!item) return acc;
      return acc + item.quantity * Number(prod.price);
    }, 0);
  };

  return (
    <section id="carello">
      <Breadcrumbs carello="Carello" />
      <HeaderCart />

      <div className="container bg-background xl:bg-transparent">
        <div className="relative flex flex-col gap-4 xl:mt-5 xl:flex-row xl:gap-5">
          <ul className="mx-auto flex w-full max-w-[916px] flex-col gap-6 rounded-sm bg-background p-3 xl:mx-0">
            {fetchedProducts.map((prod, index) => {
              const item = basket.find((b) => b.productId === prod.id);
              const price = calcProductPrice(prod.id);
              const canIncrement = item && prod && item.quantity < prod.inStock;
              const canDecrement = item && item.quantity > 1;
              return (
                <li
                  key={prod.id}
                  className={clsx(
                    "relative flex flex-col gap-3 xl:flex-row xl:gap-5",
                    index !== fetchedProducts.length - 1 &&
                      "border-b border-grey-hover-stroke pb-3 xl:pb-6",
                  )}
                >
                  <button
                    onClick={() => removeFromBasketById(prod.id)}
                    className="absolute top-0 right-0"
                  >
                    <Image src={icon_dell} alt="delete" />
                  </button>

                  <Image
                    src={prod.imgSrc}
                    alt="product"
                    width={230}
                    height={230}
                    className="card_gradient h-auto w-16 rounded-sm object-contain object-left xl:w-60"
                  />

                  <div className="flex w-full flex-col justify-between">
                    <div>
                      <h2 className="input_R_18 mt-2 line-clamp-3 max-w-[412px]">{prod.name}</h2>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-2 rounded-sm border border-stroke-grey p-2">
                        <button
                          type="button"
                          disabled={!canDecrement}
                          className={clsx(btnBase, !canDecrement ? btnDisabled : btnActive)}
                          onClick={() => canDecrement && decrementQnt(prod.id)}
                        >
                          -
                        </button>

                        <div className="flex size-11 items-center justify-center">
                          {item?.quantity ?? 0}
                        </div>

                        <button
                          type="button"
                          disabled={!canIncrement}
                          className={clsx(btnBase, !canIncrement ? btnDisabled : btnActive)}
                          onClick={() => canIncrement && incrementQnt(prod.id)}
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

            {basket.length === 0 && (
              <li className="text-center">
                Il carrello è vuoto{" "}
                <Link href="/catalogo" className="underline">
                  Vai al catalogo
                </Link>
              </li>
            )}
          </ul>

          <RepilogoComponent totalPrice={calcTotal()} basket={basket} />
        </div>
      </div>
    </section>
  );
}
