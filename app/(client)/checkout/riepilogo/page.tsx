"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function RepilogoDatiConsegna() {
  const { step } = useCheckoutStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentError = searchParams.get("payment_error");
    if (!paymentError) return;

    toast.error(
      "Pagamento non riuscito. Prova piu tardi oppure scegli un altro metodo di pagamento.",
    );
    router.replace(PAGES.CHECKOUT_PAGES.SUMMARY);
  }, [router, searchParams]);

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
