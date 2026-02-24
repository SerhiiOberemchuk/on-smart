"use client";

import Image from "next/image";
import Link from "next/link";
import carello from "@/assets/icons/carrello.svg";
import { useBasketStore } from "@/store/basket-store";

export default function Cart() {
  const { basket } = useBasketStore();
  const qnt = () => {
    if (basket.length === 0) return 0;
    return basket.reduce((acc, item) => acc + item.quantity, 0);
  };
  return (
    <Link href={"/carrello"} className="relative flex gap-2.5 p-3 md:px-4 md:py-2">
      <div className="absolute top-0 left-2 grid h-5 w-5 place-content-center place-items-center rounded-full bg-yellow-500 text-[10px] font-medium text-black">
        <span className="text-center">{qnt()}</span>
      </div>
      <Image src={carello} width={24} alt="Carrello" title="Carrello" />

      <span className="btn hidden xs:block">Carrello</span>
    </Link>
  );
}
