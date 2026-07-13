"use server";

import { ProductType } from "@/db/schemas/product.schema";
import { klarnaAuthHeader, klarnaBaseUrl } from "@/lib/klarna";
import { BasceketStoreStateType } from "@/store/basket-store";
import { CheckoutTypesDataFirstStep, CheckoutTypesDataStepConsegna } from "@/types/checkout-flow.types";
import { baseUrl } from "@/types/baseUrl";
import { PAGES } from "@/types/pages.types";
import { readJsonResponse } from "@/utils/read-json-response";
import { persistPaidOrder } from "@/app/actions/orders/_internal/persist-paid-order";
import { notifyOrderById } from "@/app/actions/notify-order-by-id/notify-order-by-id";
const siteUrl = baseUrl;

type PlaceKlarnaOrderResult =
  | { success: true; orderId: string; redirectUrl: string; persisted: boolean }
  | { success: false; error: string; status?: number };

export async function placeKlarnaOrder({
  authorizationToken,
  orderNumber,
  internalOrderId,
  dataFirstStep,
  dataCheckoutStepConsegna,
  productsInBasket,
  totalPrice,
  basket,
}: {
  authorizationToken: string;
  orderNumber: string | undefined;
  internalOrderId: string;
  dataFirstStep: CheckoutTypesDataFirstStep;
  dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna;
  productsInBasket: ProductType[];
  totalPrice: number;
  basket: BasceketStoreStateType["basket"];
}): Promise<PlaceKlarnaOrderResult> {
  const safeOrderNumber = orderNumber || "NO-ORDER-NUMBER";
  const payload = {
    purchase_country: "IT",
    purchase_currency: "EUR",
    locale: "it-IT",

    order_amount: Number((totalPrice * 100).toFixed(0)),

    order_lines: productsInBasket.map((product) => {
      const basketItem = basket.find((item) => item.productId === product.id);
      const unit_price = Number((Number(product.price) * 100).toFixed(0));
      return {
        name: product.nameFull,
        quantity: basketItem ? basketItem.quantity : 1,
        unit_price,
        total_amount: Number((unit_price * (basketItem ? basketItem.quantity : 1)).toFixed(0)),
      };
    }),
    merchant_urls: {
      confirmation: `${siteUrl}${PAGES.CHECKOUT_PAGES.COMPLETED}/${safeOrderNumber}`,
    },
    merchant_reference1: safeOrderNumber,
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
  };

  const res = await fetch(
    `${klarnaBaseUrl()}/payments/v1/authorizations/${authorizationToken}/order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: klarnaAuthHeader(),
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return { success: false, error: text, status: res.status };
  }

  const data = await readJsonResponse<{ order_id?: string; redirect_url?: string }>(res);

  if (!data || !data.order_id || !data.redirect_url) {
    return { success: false, error: "Klarna response missing order_id or redirect_url" };
  }

  // Klarna has accepted the order here on the server — mark it PAID in the same
  // trusted context rather than trusting the client to set the status.
  const persisted = await persistPaidOrder({
    orderId: internalOrderId,
    orderNumber: safeOrderNumber,
    providerOrderId: data.order_id,
  });

  if (persisted) {
    try {
      await notifyOrderById({ orderId: internalOrderId });
    } catch (error) {
      console.error("notifyOrderById after Klarna place-order failed:", error);
    }
  }

  return { success: true, orderId: data.order_id, redirectUrl: data.redirect_url, persisted };
}
