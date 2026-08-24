"use client";

import { useBasketStore } from "@/store/basket-store";
import { usePathname } from "next/navigation";

export default function HeaderCart() {
  const { basket, hasHydrated } = useBasketStore();
  const path = usePathname();

  if (path.includes("completato")) {
    return null;
  }

  // Same hydration rule as the header badge: the server knows nothing about
  // localStorage, so the count must read 0 until the store has rehydrated.
  const count = hasHydrated ? basket.reduce((acc, i) => acc + i.quantity, 0) : 0;

  return (
    <header className="bg-background">
      <div className="container py-3">
        <h1 className="H2">Carrello ({count} art.)</h1>
      </div>
    </header>
  );
}
