"use client";

import Image from "next/image";
import icon from "@/assets/icons/carrello.svg";

export default function ButtonAddToCart({ id }: { id: string }) {
  return (
    <button
      type="button"
      aria-label="Aggiungi al carrello"
      className="flex size-12 items-center justify-center rounded-sm bg-green-600"
    >
      <Image
        src={icon}
        alt="Aggiungi al carrello"
        onClick={() => {
          console.log({ productId: id });
        }}
      />
    </button>
  );
}
