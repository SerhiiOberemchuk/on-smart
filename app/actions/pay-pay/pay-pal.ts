"use server";

import { paypalApi } from "@/lib/paypal";
import { PayPalOrderCaptureResponse } from "@/types/paypal.types";

export type PayPalDraft = {
  currency: string;
  total: string;
  referenceId: string;
};

export async function createPayPalOrderAction(draft: PayPalDraft) {
  const requestId = `create-${draft.referenceId}-${Date.now()}`;

  const res = await paypalApi<{ id: string }>("/v2/checkout/orders", {
    method: "POST",
    requestId,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: draft.referenceId,
          amount: { currency_code: draft.currency, value: draft.total },
        },
      ],
      application_context: {
        brand_name: "ON-SMART",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    },
  });

  if (!res.ok) {
    console.error("PayPal create order failed:", res.error);
    return { ok: false, error: res.error }; // UI покаже toast
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
  if (!clientId) return { ok: false, error: { message: "PAYPAL_CLIENT_ID missing" } };
  return { ok: true, clientId };
}
