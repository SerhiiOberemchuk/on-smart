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

  const data = await paypalApi<{ id: string }>("/v2/checkout/orders", {
    method: "POST",
    requestId,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: draft.referenceId,
          amount: {
            currency_code: draft.currency,
            value: draft.total,
          },
        },
      ],
    },
  });

  return { orderId: data.id };
}

export async function capturePayPalOrderAction(input: { orderId: string; referenceId: string }) {
  const requestId = `capture-${input.referenceId}-${input.orderId}`;

  const data = await paypalApi<PayPalOrderCaptureResponse>(
    `/v2/checkout/orders/${input.orderId}/capture`,
    {
      method: "POST",
      requestId,
    },
  );

  return { ok: true, data };
}

export async function getPayPalClientIdAction() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) throw new Error("PAYPAL_CLIENT_ID missing");
  return { clientId };
}
