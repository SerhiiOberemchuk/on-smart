"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import PayPalButtonsClient from "./PayPalButtonsClient";
import { getPayPalClientIdAction } from "@/app/actions/pay-pay/pay-pal";
import type { PaymentWidgetData } from "@/types/payment-widget.types";

export default function PayPalPaymentWidget(
  props: PaymentWidgetData & { paymentErrorPath: string },
) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [payPalENV, setPayPalENV] = useState<ReactPayPalScriptOptions["environment"]>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const res = await getPayPalClientIdAction();

      if (!res.ok || res.error) {
        console.error("PayPal clientId error:", res.error);
        setError("Errore nel caricamento del widget PayPal.");
        setIsLoading(false);
        return;
      }

      setClientId(res.clientId);
      setPayPalENV(res.paypalEnv);
      setIsLoading(false);
    })();
  }, []);

  if (error) {
    return (
      <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (isLoading || !clientId) {
    return (
      <div className="rounded-md border border-stroke-grey bg-background px-4 py-5 text-sm text-text-grey">
        Caricamento del widget PayPal in corso...
      </div>
    );
  }

  return (
    <>
      <PayPalScriptProvider
        key={`${clientId}-${payPalENV}-EUR-capture`}
        options={{
          clientId,
          currency: "EUR",
          locale: "it_IT",
          // buyerCountry: "it",
          // intent: "capture",
          components: ["messages", "buttons"],
          environment: payPalENV,
          // debug: true,
          enableFunding: "paylater",
        }}
      >
        <PayPalButtonsClient style={{ layout: "vertical" }} {...props} />
      </PayPalScriptProvider>
    </>
  );
}
