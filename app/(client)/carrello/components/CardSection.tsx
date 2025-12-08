"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import PricesBox from "@/components/PricesBox";
import icon_dell from "@/assets/icons/icon_delete.svg";
import clsx from "clsx";
import { useBasketStore } from "@/store/basket-store";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
import RepilogoComponent from "./RepilogoComponent";
import HeaderCart from "./HeaderCart";
import Link from "next/link";
import { Product } from "@/db/schemas/product-schema";

export default function CardSection() {
  const [fetchedBasketProducts, setFetchedBasketProducts] = useState<Product[]>([]);
  const { basket, removeFromBasketById, updateBasket } = useBasketStore();

  useEffect(() => {
    // if (basket.length === 0) return;

    const fetchBasketProducts = async () => {
      try {
        const ids = basket.map((item) => item.id);
        const products = await getProductsByIds(ids);
        setFetchedBasketProducts(products.data as Product[]);
      } catch (error) {
        console.error("Error fetching basket products:", error);
      }
    };
    fetchBasketProducts();
  }, [basket]);

  const calcProductPrice = (id: string) => {
    const productInBasket = basket.find((item) => item.id === id);
    const productDetails = fetchedBasketProducts.find((prod) => prod.id === id);
    if (productInBasket && productDetails) {
      return {
        oldPrice: (productInBasket.qnt * (Number(productDetails?.oldPrice) ?? 0)).toString(),
        price: (productInBasket.qnt * Number(productDetails.price)).toString(),
      };
    } else {
      return {
        oldPrice: null,
        price: "0",
      };
    }
  };

  const incrementProductQuantity = (id: string) => {
    const productInBasket = basket.find((item) => item.id === id);
    const maxProductQnt = fetchedBasketProducts.find((prod) => prod.id === id)?.inStock || 0;
    if (productInBasket && productInBasket.qnt < maxProductQnt) {
      const newQnt = productInBasket.qnt + 1;
      updateBasket([{ id, qnt: newQnt }]);
    }
  };

  const decrementProductQuantity = (id: string) => {
    const productInBasket = basket.find((item) => item.id === id);
    if (productInBasket && productInBasket.qnt > 1) {
      const newQnt = productInBasket.qnt - 1;
      updateBasket([{ id, qnt: newQnt }]);
    }
  };

  const calcTotalePrice = () => {
    return fetchedBasketProducts.reduce((acc, prod) => {
      const productInBasket = basket.find((item) => item.id === prod.id);
      if (productInBasket) {
        return acc + productInBasket.qnt * Number(prod.price);
      }
      return acc;
    }, 0);
  };
  return (
    <section>
      <Breadcrumbs carello="Carello" />
      <HeaderCart />
      <div className="container bg-background xl:bg-transparent">
        <div className="relative flex flex-col gap-4 xl:mt-5 xl:flex-row xl:gap-5">
          <ul className="mx-auto flex w-full max-w-[916px] flex-col justify-center gap-6 rounded-sm bg-background p-3 xl:mx-0">
            {fetchedBasketProducts.map((prod, index) => {
              return (
                <li
                  key={prod.id}
                  className={clsx(
                    "relative flex flex-col justify-between gap-3 xl:flex-row xl:gap-5",
                    index !== fetchedBasketProducts.length - 1 &&
                      "border-b border-grey-hover-stroke pb-3 xl:pb-6",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => removeFromBasketById(prod.id as string)}
                    className="absolute top-0 right-0"
                  >
                    <Image src={icon_dell} alt="cestino" />
                  </button>
                  <Image
                    src={prod.imgSrc}
                    className="card_gradient h-auto w-16 rounded-sm object-contain object-left xl:w-60"
                    alt="product"
                    width={230}
                    height={230}
                  />
                  <div className="flex w-full flex-col justify-between">
                    <div>
                      <Image
                        src={prod.imgSrc}
                        width={142}
                        height={24}
                        className="h-6"
                        alt="logo product"
                      />
                      <h2 className="input_R_18 mt-2 line-clamp-3 max-w-[412px]">{prod.name}</h2>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-2 rounded-sm border border-stroke-grey p-2">
                        <button
                          type="button"
                          className="size-11"
                          onClick={() => decrementProductQuantity(prod.id as string)}
                        >
                          -
                        </button>
                        <div className="flex size-11 items-center justify-center">
                          <span>{basket.find((item) => item.id === prod.id)?.qnt || 0}</span>
                        </div>
                        <button
                          type="button"
                          className="size-11"
                          onClick={() => incrementProductQuantity(prod.id)}
                        >
                          +
                        </button>
                      </div>

                      <PricesBox
                        oldPrice={calcProductPrice(prod.id)?.oldPrice}
                        price={calcProductPrice(prod.id)?.price}
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
          <RepilogoComponent totalPrice={calcTotalePrice()} basket={basket} />
        </div>
      </div>
    </section>
  );
}
