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
      const res = await getPayPalClientIdAction();

      if (!mounted) return;

      if (!res.ok || res.error) {
        console.error("PayPal clientId error:", res.error);
        setError("Errore nel caricamento del widget PayPal.");
        return;
      }

      setClientId(res.clientId);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) return <div>{error}</div>;
  if (!clientId) return <div>Caricamento PayPal...</div>;

  return (
    <PayPalScriptProvider
      key={clientId}
      options={{
        clientId,
        // buyerCountry: "IT",
        currency: "EUR",
        intent: "capture",
        components: "buttons",
        environment: "production",
        debug: true,
      }}
    >
      <PayPalButtonsClient />
    </PayPalScriptProvider>
  );
}
