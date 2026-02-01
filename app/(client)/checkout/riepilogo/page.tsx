"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { redirect } from "next/navigation";

export default function RepilogoDatiConsegna() {
  const { step } = useCheckoutStore();

  if (step < 4) {
    redirect(PAGES.CHECKOUT_PAGES.PAYMENT);
  }
  return <PageLayoutCheckout page="riepilogo" />;
}
