"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import PayPalButtonsClient from "./PayPalButtonsClient";
import { getPayPalClientIdAction } from "@/app/actions/pay-pay/pay-pal";

export default function PayPalPaymentWidget() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [payPalENV, setPayPalENV] = useState<ReactPayPalScriptOptions["environment"]>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // let mounted = true;

    (async () => {
      const res = await getPayPalClientIdAction();

      // if (!mounted) return;

      if (!res.ok || res.error) {
        console.error("PayPal clientId error:", res.error);
        setError("Errore nel caricamento del widget PayPal.");
        return;
      }

      setClientId(res.clientId);
      setPayPalENV(res.paypalEnv);
    })();

    return () => {
      // mounted = false;
    };
  }, []);

  if (error) return <div>{error}</div>;
  if (!clientId) return <div>Caricamento PayPal...</div>;

  return (
    <PayPalScriptProvider
      key={clientId}
      options={{
        clientId,
        currency: "EUR",
        intent: "capture",
        components: "buttons",
        environment: payPalENV,
        debug: true,
      }}
    >
      {/* <PayPalButtonsClient funding={"paypal"} />
      <PayPalButtonsClient funding={"card"} />
      <PayPalButtonsClient funding={"paylater"} />
      <PayPalButtonsClient funding={"mybank"} />
      <PayPalButtonsClient funding={"applepay"} /> */}
      <PayPalButtonsClient />
    </PayPalScriptProvider>
  );
}
