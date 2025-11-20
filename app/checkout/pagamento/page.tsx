"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { redirect } from "next/navigation";

export default function CheckoutPagePagamento() {
  const { step } = useCheckoutStore();

  if (step < 3) {
    redirect("/checkout/consegna");
  }

  return <PageLayoutCheckout page="pagamento" />;
}
