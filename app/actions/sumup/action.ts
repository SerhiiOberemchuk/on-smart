"use server";

import SumUp from "@sumup/sdk";

const client = new SumUp({
  apiKey: process.env?.SUMUP_API_KEY,
});

const merchantCode = process.env.SUMUP_MERCHANT_CODE;

type CheckoutProps = {
  id: string;
  amount: number;
  checkout_reference: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  name: string;
  number: string;
};

export async function createCheckout({
  amount,
  checkout_reference,
}: Pick<CheckoutProps, "amount" | "checkout_reference">) {
  if (!merchantCode) {
    console.warn(
      "Missing merchant code, please specify merchant code using SUMUP_MERCHANT_CODE env variable.",
    );
    return;
  }
  const checkout = await client.checkouts.create({
    amount,
    checkout_reference,
    currency: "EUR",
    merchant_code: merchantCode,
  });

  return checkout;
}
