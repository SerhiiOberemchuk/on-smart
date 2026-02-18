"use client";

import { capturePayPalOrderAction, createPayPalOrderAction } from "@/app/actions/pay-pay/pay-pal";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { getTotalPriceToPay } from "@/utils/get-prices";
import { PayPalButtons, PayPalMessages, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import type { PayPalButtonsComponentOptions } from "@paypal/paypal-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PayPalButtonsClient(
  props: Pick<PayPalButtonsComponentOptions, "message" | "fundingSource" | "style">,
) {
  const [{ isPending }] = usePayPalScriptReducer();
  const { totalPrice, orderNumber, dataCheckoutStepConsegna, basket } = useCheckoutStore();
  const [priceToPay, setPriceToPay] = useState<string>("0");
  const [isMessages, setIsMessages] = useState(false);

  useEffect(() => {
    if (!totalPrice) return;
    console.log(totalPrice);
    (() => {
      setIsMessages(false);
      setPriceToPay(
        getTotalPriceToPay({
          totalPrice,
          deliveryMetod: dataCheckoutStepConsegna.deliveryMethod,
        }).toFixed(2),
      );
      setIsMessages(true);
    })();
  }, [totalPrice, dataCheckoutStepConsegna.deliveryMethod, orderNumber, basket]);
  const router = useRouter();

  if (!totalPrice || !orderNumber) {
    return <div>Errore nel caricamento del pagamento PayPal.</div>;
  }

  return (
    <div className="bg-white px-2 pt-2">
      {isPending ? <span className="animate-spin">Caricamento...</span> : null}
      <div className="py-3">
        {isMessages && (
          <PayPalMessages
            key={`pp-msg-${priceToPay}`}
            forceReRender={[priceToPay, "EUR"]}
            onApply={async (data) => {
              console.log(data);

              router.push(PAGES.CHECKOUT_PAGES.COMPLETED);
            }}
            amount={priceToPay}
            currency="EUR"
            style={{
              layout: "flex",
              ratio: "8x1",
              color: "white",
            }}
          />
        )}
      </div>
      <PayPalButtons
        {...props}
        forceReRender={[priceToPay, "EUR"]}
        createOrder={async (): Promise<string> => {
          const res = await createPayPalOrderAction({
            currency: "EUR",
            total: priceToPay,
            referenceId: orderNumber,
          });

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
            referenceId: orderNumber,
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
