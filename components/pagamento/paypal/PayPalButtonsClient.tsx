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
import type { PayPalButtonsComponentOptions } from "@paypal/paypal-js";
import { useRouter } from "next/navigation";

export default function PayPalButtonsClient(
  props: Pick<PayPalButtonsComponentOptions, "message" | "fundingSource" | "style">,
) {
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
    <div className="bg-white px-2 pt-2">
      {isPending ? <span className="animate-spin">Caricamento...</span> : null}

      <PayPalButtons
        {...props}
        createOrder={async (): Promise<string> => {
          const res = await createPayPalOrderAction(draft);

          if (!res.ok || !res.orderId) {
            console.error("Create PayPal order failed:", res.error);
            return "ERROR_ORDER";
          }

          return res.orderId;
        }}
        onApprove={async (data) => {
          console.log("PayPal onApprove data:", data);

          const orderId = data.orderID;
          if (!orderId) {
            console.error("No orderID from PayPal");
            return;
          }

          const res = await capturePayPalOrderAction({
            orderId,
            referenceId: draft.referenceId,
          });

          if (!res.ok) {
            console.error("PayPal capture failed:", res.error);
            return;
          }

          console.log("PayPal CAPTURE OK:", res.data);
          router.push(PAGES.CHECKOUT_PAGES.COMPLETED);
        }}
        onCancel={(data) => {
          console.warn("PayPal onCancel:", data);
        }}
        onError={(err) => {
          console.error("PayPal error", err);
        }}
      />
    </div>
  );
}
