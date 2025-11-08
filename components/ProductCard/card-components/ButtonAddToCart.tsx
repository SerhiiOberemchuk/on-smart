"use client";

import Image from "next/image";
import icon from "@/assets/icons/carrello.svg";

import { useCardDialogStore } from "../card-dialog-components/card-dialog-store";

export default function ButtonAddToCart({ id }: { id: string }) {
  const { openDialog } = useCardDialogStore();
  return (
    <>
      <button
        type="button"
        aria-label="Aggiungi al carrello"
        className="flex size-12 items-center justify-center rounded-sm bg-green-600"
        onClick={() => openDialog(id)}
      >
        <Image src={icon} alt="Aggiungi al carrello" />
      </button>
    </>
  );
}
