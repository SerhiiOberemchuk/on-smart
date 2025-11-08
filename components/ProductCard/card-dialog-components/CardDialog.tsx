"use client";

import { useEffect, useRef } from "react";
import { useCardDialogStore } from "./card-dialog-store";
import Image from "next/image";
import iconBack from "@/assets/icons/arrow_back.svg";
import iconClose from "@/assets/icons/icon-close.svg";
import iconCart from "@/assets/icons/carrello.svg";
import styles from "./style.module.css";
import clsx from "clsx";
import { ProductCardDialog } from "./ProductCardDialog";
import PricesBox from "@/components/PricesBox";
import { Product } from "@/types/product.types";

const product: Product = {
  id: "1",
  brand: "BrandName",
  name: "Distributore automatico di sapone 2-Cam Kit, nero повна назва комплектації",
  price: 12,
  oldPrice: 62,
  inStock: 0,
  images: ["/products/category1.avif", "/products/product.png"],
  description: "This is a sample product description.",
  imgSrc: "/products/product.png",
  category: "Category1",
  quantity: 100,
  rating: 4.5,
  logo: "/products/logo-mach-power.svg",
};

export default function CardDialog() {
  const refDialog = useRef<HTMLDialogElement>(null);
  const { isOpenDialog, id, closeDialog } = useCardDialogStore();

  useEffect(() => {
    if (isOpenDialog) {
      refDialog.current?.showModal();
    } else {
      refDialog.current?.close();
    }
  }, [isOpenDialog]);

  return (
    <dialog
      aria-modal={isOpenDialog}
      id={"card-dialog-global"}
      ref={refDialog}
      className={styles.dialog_backdrop}
    >
      <div className="fixed top-0 right-0 bottom-0 left-0 overflow-x-hidden" onClick={closeDialog}>
        <div
          className={clsx(
            "ml-auto flex h-screen w-full max-w-[1110px] flex-col xl:max-h-[780px]",
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
            <ProductCardDialog
              logo={product.logo}
              price={5}
              images={["/products/category1.avif", "/products/product.png"]}
              id={id}
              inStock={product.inStock}
              oldPrice={product.oldPrice}
              name={product.name}
            />
            <div className="flex-1 bg-black">
              <div className="h-96 bg-red"></div>
              <p className="text-white">{id}</p>
            </div>
          </div>
          <div className="bg-background p-4">
            <div className="ml-auto flex w-full max-w-[618px] justify-between">
              <PricesBox
                totaleTitle={true}
                place="dialog-cart-product-footer"
                price={product.price}
                oldPrice={product.oldPrice}
              />
              <button
                type="button"
                className="btn flex items-center gap-2 rounded-sm bg-green px-4 py-3 text-white"
                onClick={() => console.log({ id })}
              >
                <Image src={iconCart} alt="Pulsante aggiungi" />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
