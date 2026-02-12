"use server";

import { ProductType } from "@/db/schemas/product.schema";
import { klarnaAuthHeader, klarnaBaseUrl } from "@/lib/klarna";
import { BasceketStoreStateType } from "@/store/basket-store";
import { InputsCheckoutStep1, InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";
import { PAGES } from "@/types/pages.types";

export type KlarnaSessionResponseType = {
  session_id: string;
  client_token: string;
  payment_method_categories: {
    identifier: string;
    name: string;
    asset_urls: {
      descriptive: string;
      standard: string;
    };
  }[];
};

export async function createKlarnaSessionAction({
  orderNumber,
  dataFirstStep,
  dataCheckoutStepConsegna,
  productsInBasket,
  totalPrice,
  basket,
}: {
  orderNumber: string | undefined;
  dataFirstStep: Partial<InputsCheckoutStep1>;
  dataCheckoutStepConsegna: Partial<InputsCheckoutStep2Consegna>;
  productsInBasket: ProductType[];
  totalPrice: number;
  basket: BasceketStoreStateType["basket"];
}): Promise<KlarnaSessionResponseType> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const payload = {
    billing_address: {
      given_name: dataFirstStep.nome,
      family_name: dataFirstStep.cognome,
      email: dataFirstStep.email,
      phone: dataFirstStep.numeroTelefono,
      street_address: dataFirstStep.indirizzo,
      postal_code: dataFirstStep.cap,
      city: dataFirstStep.città,
      country: "IT",
    },

    shipping_address:
      dataCheckoutStepConsegna.deliveryMethod === "ritiro_negozio"
        ? undefined
        : dataCheckoutStepConsegna.sameAsBilling
          ? {
              given_name: dataFirstStep.nome,
              family_name: dataFirstStep.cognome,
              email: dataFirstStep.email,
              phone: dataFirstStep.numeroTelefono,
              street_address: dataFirstStep.indirizzo,
              postal_code: dataFirstStep.cap,
              city: dataFirstStep.città,
              country: "IT",
            }
          : {
              given_name: dataCheckoutStepConsegna.referente_contatto,
              email: dataFirstStep.email,
              phone: dataFirstStep.numeroTelefono,
              street_address: dataCheckoutStepConsegna.indirizzo,
              postal_code: dataCheckoutStepConsegna.cap,
              city: dataCheckoutStepConsegna.città,
              country: "IT",
            },

    purchase_country: "IT",
    purchase_currency: "EUR",
    locale: "it-IT",
    order_amount: Number((totalPrice * 100).toFixed(0)),

    order_lines: productsInBasket.map((product) => {
      const basketItem = basket.find((item) => item.id === product.id);
      const unit_price = Number((Number(product.price) * 100).toFixed(0));
      return {
        name: product.nameFull,
        quantity: basketItem ? basketItem.qnt : 1,
        unit_price,
        total_amount: Number((unit_price * (basketItem ? basketItem.qnt : 1)).toFixed(0)),
      };
    }),

    merchant_reference1: orderNumber || "NO-ORDER-NUMBER",
    merchant_urls: {
      //   terms: `${siteUrl}/termini-condizioni`,
      //   checkout: `${siteUrl}/checkout`,
      confirmation: `${siteUrl}${PAGES.CHECKOUT_PAGES.COMPLETED}`,
    },
  };

  const res = await fetch(`${klarnaBaseUrl()}/payments/v1/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: klarnaAuthHeader(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Klarna create session failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  return {
    session_id: data.session_id as string,
    client_token: data.client_token as string,
    payment_method_categories: data.payment_method_categories,
  };
}
