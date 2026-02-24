"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RepilogoDatiConsegna() {
  const { step } = useCheckoutStore();
  const router = useRouter();
  useEffect(() => {
    if (step < 4) {
      router.replace(PAGES.CHECKOUT_PAGES.PAYMENT);
    }
  }, [router, step]);
  if (step < 4) {
    return null;
  }
  return <PageLayoutCheckout page="riepilogo" />;
}
