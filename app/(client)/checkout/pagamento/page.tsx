"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPagePagamento() {
  const { step } = useCheckoutStore();
  const router = useRouter();

  useEffect(() => {
    if (step < 3) {
      router.replace(PAGES.CHECKOUT_PAGES.DELIVERY);
    }
  }, [router, step]);

  if (step < 3) {
    return null;
  }
  return <PageLayoutCheckout page="pagamento" />;
}
