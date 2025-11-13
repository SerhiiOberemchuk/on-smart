"use client";

import iconSuccess from "@/assets/icons/icon_success.svg";
import { useBasketStore } from "@/store/basket-store";
import Image from "next/image";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export default function InfoPopupAddedToBasket({ className }: { className?: string }) {
  const { isPopupOpen, hidePopup, qntToShow } = useBasketStore();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPopupOpen) {
        hidePopup();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isPopupOpen, hidePopup]);

  if (!isPopupOpen) {
    return null;
  }

  return (
    <div
      className={twMerge(
        "body_R_20 z-999999 mx-auto mt-auto flex w-max items-center gap-2 rounded-sm bg-green-700 px-2 py-3 text-white xl:w-auto xl:px-3",

        className,
      )}
    >
      <Image src={iconSuccess} alt="Success" aria-hidden="true" className="size-4 xl:size-6" />
      <span className="">Aggiunto al carrello({qntToShow} pz.)</span>
    </div>
  );
}
