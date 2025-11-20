"use client";
import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { redirect } from "next/navigation";

export default function PageCheckoutConsegna() {
  const { step } = useCheckoutStore();

  if (step < 2) {
    redirect("/checkout");
  }

  return <PageLayoutCheckout page="consegna" />;
}
