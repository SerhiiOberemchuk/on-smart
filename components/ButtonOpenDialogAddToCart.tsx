"use client";

import Image from "next/image";
import icon from "@/assets/icons/carrello.svg";

import { useCardDialogStore } from "../store/card-dialog-store";
import { Product } from "@/types/product.types";

export default function ButtonOpenDialogAddToCart(product: Product) {
  const { openDialog } = useCardDialogStore();
  return (
    <>
      <button
        type="button"
        aria-label="Aggiungi al carrello"
        className="flex size-12 items-center justify-center rounded-sm bg-green-600"
        onClick={() => openDialog(product)}
      >
        <Image src={icon} alt="Aggiungi al carrello" />
      </button>
    </>
  );
}
