"use client";
import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PageCheckoutConsegna() {
  const { step } = useCheckoutStore();
  const router = useRouter();

  useEffect(() => {
    if (step < 2) {
      router.replace(PAGES.CHECKOUT_PAGES.INFORMATION);
    }
  }, [step, router]);
  if (step < 2) {
    return null;
  }

  return <PageLayoutCheckout page="consegna" />;
}
