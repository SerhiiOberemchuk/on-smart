"use client";

import {
  capturePayPalOrderAction,
  createPayPalOrderAction,
  PayPalDraft,
} from "@/app/actions/pay-pay/pay-pal";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { getTotalPriceToPay } from "@/utils/get-prices";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

export default function PayPalButtonsClient() {
  const [{ isPending }] = usePayPalScriptReducer();
  const { totalPrice, orderNumber, dataCheckoutStepConsegna } = useCheckoutStore();
  const router = useRouter();
  if (!totalPrice || !orderNumber) {
    return <div>Errore nel caricamento del pagamento PayPal.</div>;
  }
  const draft: PayPalDraft = {
    currency: "EUR",
    total: getTotalPriceToPay({
      totalPrice,
      deliveryMetod: dataCheckoutStepConsegna.deliveryMethod,
    }).toFixed(2),
    referenceId: orderNumber,
  };

  return (
    <>
      {isPending ? <div className="animate-spin" /> : null}
      <PayPalButtons
        style={{ layout: "horizontal", label: "buynow" }}
        message={{
          color: "white",
          align: "center",
          position: "bottom",
        }}
        createOrder={async () => {
          console.log("Creating PayPal order with draft:", draft);
          const { orderId } = await createPayPalOrderAction(draft);
          return orderId;
        }}
        onApprove={async (data) => {
          console.log("PayPal onApprove data:", data);
          const orderId = data.orderID;
          if (!orderId) throw new Error("No orderID from PayPal");

          const result = await capturePayPalOrderAction({
            orderId,
            referenceId: draft.referenceId,
          });

          console.log("PayPal CAPTURE OK:", result);
          router.push(PAGES.CHECKOUT_PAGES.COMPLETED);
        }}
        onCancel={(data) => {
          console.warn("PayPal onCancel:", data);
        }}
        onError={(err) => {
          console.error("PayPal error", err);
        }}
      />
    </>
  );
}
