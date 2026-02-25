"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PageCheckout() {
  const { step } = useCheckoutStore();
  const router = useRouter();

  useEffect(() => {
    if (step < 1) {
      router.push(PAGES.MAIN_PAGES.CATALOG);
    }
  }, [router, step]);
  if (step < 1) {
    return null;
  }

  return <PageLayoutCheckout page="informazioni" />;
}
