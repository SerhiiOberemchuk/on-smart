"use server";

import { ProductType } from "@/db/schemas/product.schema";
import { buildKlarnaOrderLines, klarnaAuthHeader, klarnaBaseUrl } from "@/lib/klarna";
import { BasceketStoreStateType } from "@/store/basket-store";
import { CheckoutTypesDataFirstStep, CheckoutTypesDataStepConsegna } from "@/types/checkout-flow.types";
import { baseUrl } from "@/types/baseUrl";
import { PAGES } from "@/types/pages.types";
import { readJsonResponse } from "@/utils/read-json-response";

export type KlarnaSessionResponseType = {
  session_id: string;
  client_token: string;
  error?: string;
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
  deliveryPrice,
  commission,
  basket,
}: {
  orderNumber: string | undefined;
  dataFirstStep: CheckoutTypesDataFirstStep;
  dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna;
  productsInBasket: ProductType[];
  deliveryPrice: number;
  commission: number;
  basket: BasceketStoreStateType["basket"];
}): Promise<KlarnaSessionResponseType> {
  const siteUrl = baseUrl;
  const safeOrderNumber = orderNumber || "NO-ORDER-NUMBER";

  const order_lines = buildKlarnaOrderLines({
    productsInBasket,
    basket,
    deliveryPrice,
    commission,
  });
  const order_amount = order_lines.reduce((sum, line) => sum + line.total_amount, 0);

  const payload = {
    billing_address: {
      given_name: dataFirstStep.nome,
      family_name: dataFirstStep.cognome,
      email: dataFirstStep.email,
      phone: dataFirstStep.numeroTelefono,
      street_address: dataFirstStep.indirizzo,
      postal_code: dataFirstStep.cap,
      city: dataFirstStep.citta,
      country: "IT",
    },

    shipping_address:
      dataFirstStep.deliveryMethod === "RITIRO_NEGOZIO"
        ? undefined
        : dataCheckoutStepConsegna.sameAsBilling
          ? {
              given_name: dataFirstStep.nome,
              family_name: dataFirstStep.cognome,
              email: dataFirstStep.email,
              phone: dataFirstStep.numeroTelefono,
              street_address: dataFirstStep.indirizzo,
              postal_code: dataFirstStep.cap,
              city: dataFirstStep.citta,
              country: "IT",
            }
          : {
              given_name: dataCheckoutStepConsegna.deliveryAdress?.referente_contatto,
              email: dataFirstStep.email,
              phone: dataFirstStep.numeroTelefono,
              street_address: dataCheckoutStepConsegna.deliveryAdress?.indirizzo,
              postal_code: dataCheckoutStepConsegna.deliveryAdress?.cap,
              city: dataCheckoutStepConsegna.deliveryAdress?.citta,
              country: "IT",
            },

    purchase_country: "IT",
    purchase_currency: "EUR",
    locale: "it-IT",
    order_amount,
    order_lines,

    merchant_reference1: safeOrderNumber,
    merchant_urls: {
      //   terms: `${siteUrl}/termini-condizioni`,
      //   checkout: `${siteUrl}/checkout`,
      confirmation: `${siteUrl}${PAGES.CHECKOUT_PAGES.COMPLETED}/${safeOrderNumber}`,
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

    return {
      error: `Klarna create session failed: ${res.status} ${text}`,
      session_id: "",
      client_token: "",
      payment_method_categories: [],
    };
    // throw new Error(`Klarna create session failed: ${res.status} ${text}`);
  }

  const data = await readJsonResponse<{
    session_id: string;
    client_token: string;
    payment_method_categories: KlarnaSessionResponseType["payment_method_categories"];
  }>(res);

  if (!data) {
    return {
      error: "Klarna create session: empty or invalid response body",
      session_id: "",
      client_token: "",
      payment_method_categories: [],
    };
  }

  return {
    session_id: data.session_id,
    client_token: data.client_token,
    payment_method_categories: data.payment_method_categories,
  };
}
