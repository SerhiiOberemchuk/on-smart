"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import PricesBox from "@/components/PricesBox";
// import ProductQuantityInputButtons from "@/components/ProductQuantityInputButtons";
import { Product } from "@/types/product.types";
import icon_dell from "@/assets/icons/icon_delete.svg";
import clsx from "clsx";
import { useBasketStore } from "@/store/basket-store";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
export default function CardSection() {
  const [fetchedBasketProducts, setFetchedBasketProducts] = useState<Product[]>([]);
  const { basket, removeFromBasketById, updateBasket } = useBasketStore();

  useEffect(() => {
    const fetchBasketProducts = async () => {
      try {
        const ids = basket.map((item) => ({ id: item.id }));
        const products = await getProductsByIds(ids);
        setFetchedBasketProducts(products as Product[]);
        console.log({ products });
      } catch (error) {
        console.error("Error fetching basket products:", error);
      }
    };
    fetchBasketProducts();
  }, [basket]);

  const calcProductPrice = useCallback(
    (id: string) => {
      const productInBasket = basket.find((item) => item.id === id);
      const productDetails = fetchedBasketProducts.find((prod) => prod.id === id);
      if (productInBasket && productDetails) {
        return {
          oldPrice: productInBasket.qnt * (productDetails?.oldPrice ?? 0),
          price: productInBasket.qnt * productDetails.price,
        };
      }
    },
    [basket, fetchedBasketProducts],
  );

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
        return acc + productInBasket.qnt * prod.price;
      }
      return acc;
    }, 0);
  };
  return (
    <section>
      <Breadcrumbs carello="Carello" />
      <header className="bg-background">
        <div className="container py-3">
          <h1 className="H2">Carrello ({fetchedBasketProducts.length} art.)</h1>
        </div>
      </header>
      <div className="container">
        <div className="relative flex flex-col gap-4 xl:mt-5 xl:flex-row xl:gap-5">
          <ul className="mx-auto flex w-full max-w-[916px] flex-col gap-6 rounded-sm bg-background p-3 xl:mx-0">
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
                    onClick={() => removeFromBasketById(prod.id)}
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
                        src={prod.logo}
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
                          onClick={() => decrementProductQuantity(prod.id)}
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
                        price={calcProductPrice(prod.id)?.price || 0}
                        place="main-card-product"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="w-full xl:max-w-[426px]">
            <div className="sticky top-5 flex w-full flex-col gap-6 rounded-sm bg-background p-3">
              <h3 className="H4M">Riepilogo Ordine</h3>
              <ul className="flex flex-col gap-3">
                {[
                  { title: "articolo (li)", price: calcTotalePrice() },
                  { title: "IVA (inclusa)", price: 2 },
                  { title: "Spedizione", price: 0 },
                ].map((i, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text_R">
                      <span className={clsx(index !== 0 && "hidden")}>
                        {" "}
                        {basket.reduce((acc, item) => {
                          return acc + item.qnt;
                        }, 0)}
                      </span>{" "}
                      {i.title}
                    </span>
                    <span className="input_R_18">{i.price.toFixed(2)} €</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <h4 className="H3">Totale</h4>
                <span className="H4M">{calcTotalePrice().toFixed(2)} €</span>
              </div>
              <button type="button" className="btn rounded-sm bg-yellow-500 p-3 text-black">
                Procedi all’ordine
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
