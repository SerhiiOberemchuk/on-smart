"use client";

import {
  capturePayPalOrderAction,
  createPayPalOrderAction,
  PayPalDraft,
} from "@/app/actions/pay-pay/pay-pal";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

export default function PayPalButtonsClient() {
  const [{ isPending }] = usePayPalScriptReducer();
  const { totalPrice, orderNumber } = useCheckoutStore();
  const router = useRouter();
  if (!totalPrice || !orderNumber) {
    return <div>Errore nel caricamento del pagamento PayPal.</div>;
  }
  const draft: PayPalDraft = {
    currency: "EUR",
    total: totalPrice.toFixed(2),
    referenceId: orderNumber,
  };

  return (
    <>
      {isPending ? <div className="animate-spin" /> : null}
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={async () => {
          const { orderId } = await createPayPalOrderAction(draft);
          return orderId;
        }}
        onApprove={async (data) => {
          const orderId = data.orderID;
          if (!orderId) throw new Error("No orderID from PayPal");

          const result = await capturePayPalOrderAction({
            orderId,
            referenceId: draft.referenceId,
          });

          console.log("PayPal CAPTURE OK:", result);
          router.push(PAGES.CHECKOUT_PAGES.COMPLETED);
        }}
        onError={(err) => {
          console.error("PayPal error", err);
        }}
      />
    </>
  );
}
