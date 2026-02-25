"use server";

import { PAGES } from "@/types/pages.types";
import SumUp from "@sumup/sdk";

const client = new SumUp({
  apiKey: process.env?.SUMUP_API_KEY,
});

const baseSiteURL = process.env.NEXT_PUBLIC_SITE_URL;

export async function deactivateCheckoutSumUp({ id }: { id: string }) {
  try {
    const checkout = await client.checkouts.deactivate(id);
    return checkout;
  } catch (error) {
    return error;
  }
}

const API_URL = "https://api.sumup.com/v0.1/checkouts";

const SUMUP_API_KEY = process.env.SUMUP_API_KEY;
const MERCHANT_CODE = process.env.SUMUP_MERCHANT_CODE;

type SumUpHostedCheckoutRequest = {
  checkout_reference: string;
  amount: number;
  currency: "EUR";
  merchant_country: "IT";
  merchant_code: string;
  description?: string;
  return_url?: string;
  redirect_url?: string;
  hosted_checkout: { enabled: true };
};

type SumUpHostedCheckoutResponse = {
  id: string;
  status?: "PENDING" | "FAILED" | "PAID";
  hosted_checkout_url: string;
};

type CreateSumUpCheckoutInput = {
  orderNumber: string;
  amount: number;
  checkout_reference: string;
  description?: string;
};

type CreateSumUpCheckoutResult =
  | { success: true; data: SumUpHostedCheckoutResponse }
  | { success: false; error: string; status?: number };

export async function createSumUpCheckout(
  input: CreateSumUpCheckoutInput,
): Promise<CreateSumUpCheckoutResult> {
  try {
    if (!SUMUP_API_KEY) {
      return { success: false, error: "Missing SUMUP_API_KEY" };
    }
    if (!MERCHANT_CODE) {
      return { success: false, error: "Missing SUMUP_MERCHANT_CODE" };
    }
    if (!baseSiteURL) {
      return { success: false, error: "Missing SITE_URL" };
    }

    const payload: SumUpHostedCheckoutRequest = {
      checkout_reference: input.checkout_reference,
      amount: input.amount,
      currency: "EUR",
      merchant_country: "IT",
      merchant_code: MERCHANT_CODE,
      description: input.description ?? `Order ${input.checkout_reference}`,
      return_url: `${baseSiteURL}${PAGES.CHECKOUT_PAGES.COMPLETED}/${input.orderNumber}`,
      redirect_url: `${baseSiteURL}${PAGES.CHECKOUT_PAGES.COMPLETED}/${input.orderNumber}`,
      hosted_checkout: { enabled: true },
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUMUP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        status: res.status,
        error: `SumUp create checkout failed: ${res.status}${text ? ` - ${text}` : ""}`,
      };
    }

    const data = (await res.json()) as SumUpHostedCheckoutResponse;

    if (!data.hosted_checkout_url) {
      return { success: false, error: "SumUp did not return hosted_checkout_url" };
    }

    return { success: true, data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    return { success: false, error: message };
  }
}
