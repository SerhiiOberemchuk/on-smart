"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { redirect } from "next/navigation";

export default function RepilogoDatiConsegna() {
  const { step } = useCheckoutStore();

  if (step < 4) {
    redirect("/checkout/pagamento");
  }
  return <PageLayoutCheckout page="riepilogo" />;
}
