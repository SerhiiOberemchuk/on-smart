"use client";

import Image from "next/image";
import icon from "@/assets/icons/carrello.svg";

import { useCardDialogStore } from "../store/card-dialog-store";
import { Product } from "@/db/schemas/product-schema";

export default function ButtonOpenDialogAddToCart(product: Product) {
  const { openDialog } = useCardDialogStore();
  return (
    <>
      <button
        type="button"
        aria-label="Aggiungi al carrello"
        className="flex size-12 items-center justify-center rounded-sm bg-green-600 hover:bg-green-700"
        onClick={() => openDialog(product)}
      >
        <Image src={icon} alt="Aggiungi al carrello" />
      </button>
    </>
  );
}
