"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButtonsClient from "./PayPalButtonsClient";
import { getPayPalClientIdAction } from "@/app/actions/pay-pay/pay-pal";

export default function PayPalPaymentWidget() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getPayPalClientIdAction();
        if (!mounted) return;
        setClientId(res.clientId);
      } catch (e) {
        if (!mounted) return;
        setError("Errore nel caricamento del widget PayPal.");
        console.error(e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) return <div>{error}</div>;
  if (!clientId) return <div>Caricamento PayPal...</div>;

  return (
    <PayPalScriptProvider options={{ clientId, currency: "EUR", intent: "capture" }}>
      <PayPalButtonsClient />
    </PayPalScriptProvider>
  );
}
