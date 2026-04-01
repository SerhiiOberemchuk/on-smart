"use client";

import PageLayoutCheckout from "@/components/CheckoutPagesComponents/PageLayoutCheckout";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const PERSISTENT_PAYMENT_TOAST_OPTIONS = {
  autoClose: false,
  closeOnClick: true,
} as const;

export default function RepilogoDatiConsegna() {
  const { step } = useCheckoutStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentError = searchParams.get("payment_error");
    if (!paymentError) return;

    if (
      paymentError === "sumup_paid_persist_failed" ||
      paymentError === "paypal_paid_persist_failed" ||
      paymentError === "klarna_paid_persist_failed"
    ) {
      toast.warning(
        "Pagamento ricevuto, ma la conferma interna dell'ordine è in ritardo. Non ripetere il pagamento. Se necessario contatta il supporto.",
        PERSISTENT_PAYMENT_TOAST_OPTIONS,
      );
      router.replace(PAGES.CHECKOUT_PAGES.SUMMARY);
      return;
    }

    toast.error(
      "Pagamento non riuscito. Prova piu tardi oppure scegli un altro metodo di pagamento.",
      PERSISTENT_PAYMENT_TOAST_OPTIONS,
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
