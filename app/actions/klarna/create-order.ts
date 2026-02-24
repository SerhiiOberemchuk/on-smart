"use server";

import { ProductType } from "@/db/schemas/product.schema";
import { klarnaAuthHeader, klarnaBaseUrl } from "@/lib/klarna";
import { BasceketStoreStateType } from "@/store/basket-store";
import { CheckoutTypesDataFirstStep, CheckoutTypesDataStepConsegna } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export async function placeKlarnaOrder({
  authorizationToken,
  orderNumber,
  dataFirstStep,
  dataCheckoutStepConsegna,
  productsInBasket,
  totalPrice,
  basket,
}: {
  authorizationToken: string;
  orderNumber: string | undefined;
  dataFirstStep: CheckoutTypesDataFirstStep;
  dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna;
  productsInBasket: ProductType[];
  totalPrice: number;
  basket: BasceketStoreStateType["basket"];
}) {
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
      confirmation: `${siteUrl}${PAGES.CHECKOUT_PAGES.COMPLETED}`,
    },
    merchant_reference1: orderNumber || "NO-ORDER-NUMBER",
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
    return { success: false, error: text };
  }

  const data = await res.json();

  if (data.redirect_url) {
    return { redirectUrl: data.redirect_url };
  }

  return { success: true };
}
