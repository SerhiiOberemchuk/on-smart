"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import PricesBox from "@/components/PricesBox";
import ProductQuantityInputButtons from "@/components/ProductQuantityInputButtons";
import { Product } from "@/types/product.types";
import icon_dell from "@/assets/icons/icon_delete.svg";
import clsx from "clsx";
import { useBasketStore } from "@/store/basket-store";
import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
export default function CardSection() {
  const [selectedProduct, setSelectedProduct] = useState<(Product & { qnt: number }) | null>(null);
  const [basketProducts, setBasketProducts] = useState<Product[]>([]);
  const { basket, removeFromBasketById, updateBasket } = useBasketStore();

  useEffect(() => {
    const fetchBasketProducts = async () => {
      try {
        const products = await getProductsByIds(basket);
        console.log({ products });
      } catch (error) {
        console.error("Error fetching basket products:", error);
      }
    };
    fetchBasketProducts();
  }, [basket]);
  const articoli = 5;
  const totale = 7.0;
  return (
    <section>
      <Breadcrumbs carello="Carello" />
      <header className="bg-background">
        <div className="container py-3">
          <h1 className="H2">Carrello (3 art.)</h1>
        </div>
      </header>
      <div className="container flex flex-col gap-4 xl:mt-5 xl:flex-row xl:gap-5">
        <ul className="mx-auto flex w-full max-w-[916px] flex-col rounded-sm bg-background p-3 xl:mx-0">
          <li className="relative flex flex-col gap-3 border-b border-grey-hover-stroke pb-3 xl:flex-row xl:gap-5 xl:pb-6">
            <button type="button">
              <Image src={icon_dell} alt="cestino" className="absolute top-0 right-0" />
            </button>
            <Image
              src={"/products/product.png"}
              className="card_gradient h-auto w-16 rounded-sm md:w-60"
              alt="product"
              width={230}
              height={230}
            />
            <div className="w-full">
              <Image
                src={"/products/logo-mach-power.svg"}
                width={142}
                height={24}
                alt="logo product"
              />
              <h2 className="input_R_18 mt-2 max-w-[412px]">
                Un distributore automatico di sapone è un dispositivo innovativo progettato per
                erogare sapone liquido in modo pratico e igienico.
              </h2>
              <div className="mt-2 flex items-end justify-between">
                <ProductQuantityInputButtons
                  className="mt-2"
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                />
                <PricesBox oldPrice={5} price={5} place="main-card-product" />
              </div>
            </div>
          </li>
        </ul>
        <div className="flex w-full flex-col gap-6 rounded-sm bg-background p-3 xl:max-w-[426px]">
          <h3 className="H4M">Riepilogo Ordine</h3>
          <ul className="flex flex-col gap-3">
            {[
              { title: "articolo (li)", price: 5 },
              { title: "IVA (inclusa)", price: 2 },
              { title: "Spedizione", price: 0 },
            ].map((i, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="text_R">
                  <span className={clsx(index !== 0 && "hidden")}> {articoli}</span> {i.title}
                </span>
                <span className="input_R_18">{i.price.toFixed(2)} €</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <h4 className="H3">Totale</h4>
            <span className="H4M">{totale.toFixed(2)} €</span>
          </div>
          <button type="button" className="btn rounded-sm bg-yellow-500 p-3 text-black">
            Procedi all’ordine
          </button>
        </div>
      </div>
    </section>
  );
}
