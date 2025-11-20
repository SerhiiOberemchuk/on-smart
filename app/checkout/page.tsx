"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { redirect } from "next/navigation";

export default function PageCheckout() {
  const { step } = useCheckoutStore();
  if (step === 0) redirect("/carrello");
  return <PageLayoutCheckout page="client-data" />;
}
