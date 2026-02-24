"use server";

import { paypalApi } from "@/lib/paypal";
import { PayPalOrderCaptureResponse } from "@/types/paypal.types";
import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

export type PayPalDraft = {
  total: string;
  referenceId: string;
};

export async function createPayPalOrderAction({ total, referenceId }: PayPalDraft) {
  const requestId = `create-${referenceId}-${Date.now()}`;

  const res = await paypalApi<{ id: string }>("/v2/checkout/orders", {
    method: "POST",
    requestId,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          amount: { currency_code: "EUR", value: total },
        },
      ],
      application_context: {
        brand_name: "ON-SMART",
        landing_page: "NO_PREFERENCE",
        // user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    },
  });
  console.log(res);

  if (!res.ok) {
    console.error("PayPal create order failed:", res.error);
    return { ok: false, error: res.error };
  }

  console.log("PayPal created order id:", res.data.id);
  return { ok: true, orderId: res.data.id };
}

export async function capturePayPalOrderAction(input: { orderId: string; referenceId: string }) {
  const requestId = `capture-${input.referenceId}-${input.orderId}`;

  const res = await paypalApi<PayPalOrderCaptureResponse>(
    `/v2/checkout/orders/${input.orderId}/capture`,
    { method: "POST", requestId },
  );

  if (!res.ok) {
    console.error("PayPal capture failed:", res.error);
    return { ok: false, error: res.error };
  }

  return { ok: true, data: res.data };
}

export async function getPayPalClientIdAction() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const paypalEnv = process.env.PAYPAL_ENV as ReactPayPalScriptOptions["environment"];
  if (!clientId || !paypalEnv)
    return { ok: false, error: { message: "PAYPAL_CLIENT_ID or PAYPAL_ENV missing" } };
  return { ok: true, clientId, paypalEnv };
}
