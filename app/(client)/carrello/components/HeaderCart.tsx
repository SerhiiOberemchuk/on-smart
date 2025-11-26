"use client";

import { useBasketStore } from "@/store/basket-store";
import { usePathname } from "next/navigation";

export default function HeaderCart() {
  const { basket } = useBasketStore();
  const path = usePathname();
  console.log({ path });

  if (path.includes("completato")) {
    return null;
  }
  return (
    <header className="bg-background">
      <div className="container py-3">
        <h1 className="H2">Carrello ({basket.reduce((acc, i) => acc + i.qnt, 0)} art.)</h1>
      </div>
    </header>
  );
}
