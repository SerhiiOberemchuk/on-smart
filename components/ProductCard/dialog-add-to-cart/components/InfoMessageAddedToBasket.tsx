"use client";

import iconSuccess from "@/assets/icons/icon_success.svg";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

export default function InfoMessageAddedToBasket({
  quantity,
  className,
}: {
  quantity: number;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        "body_R_20 mx-auto mt-auto flex h-12 items-center gap-2 rounded-sm bg-green-400/10 px-2 py-3 text-white xl:px-3",
        className,
      )}
    >
      <Image src={iconSuccess} alt="Success" aria-hidden="true" className="size-4 xl:size-6" />
      <span>Aggiunto al carrello({quantity} pz.)</span>
    </div>
  );
}
