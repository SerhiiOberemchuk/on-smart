"use client";

import { useEffect } from "react";
import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";

export default function CompletionCleanup() {
  const { clearAllCheckoutData } = useCheckoutStore();
  const { clearBasketStore } = useBasketStore();

  useEffect(() => {
    const clear = setTimeout(() => {
      clearAllCheckoutData();
      clearBasketStore();
    }, 1000);

    return () => clearTimeout(clear);
  }, [clearAllCheckoutData, clearBasketStore]);

  return null;
}
