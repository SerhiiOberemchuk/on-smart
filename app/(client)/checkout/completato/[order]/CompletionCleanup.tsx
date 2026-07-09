"use client";

import { useEffect } from "react";
import { useBasketStore } from "@/store/basket-store";

export default function CompletionCleanup() {
  const { clearBasketStore } = useBasketStore();

  useEffect(() => {
    const clear = setTimeout(() => {
      clearBasketStore();
    }, 1000);

    return () => clearTimeout(clear);
  }, [clearBasketStore]);

  return null;
}
