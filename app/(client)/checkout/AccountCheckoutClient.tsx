"use client";

import BonificoPaymentWidget from "@/components/pagamento/bonifico/BonificoPaymentWidget";
import KlarnaPaymentWidget from "@/components/pagamento/klarna/KlarnaPaymentWidget";
import PayPalPaymentWidget from "@/components/pagamento/paypal/PayPalPaymentWidget";
import SumUpWidget from "@/components/pagamento/sumup/SumUpWidget";
import type { CustomerProfileType } from "@/db/schemas/customer-profile.schema";
import type { UserAddressType } from "@/db/schemas/user-addresses.schema";
import type {
  CheckoutTypesDataFirstStep,
  CheckoutTypesDataStepConsegna,
} from "@/types/checkout-flow.types";
import { useBasketStore } from "@/store/basket-store";
import { PAYMENT_METHODS } from "@/types/bonifico.data";
import type { PaymentProviderTypes } from "@/types/payments.types";
import {
  PAYPAL_COMMISSION_LABEL,
  getDeliveryPrice,
  getPaymentCommission,
  getTotalPriceToPay,
  getTotalPriceToPayWithCommission,
} from "@/utils/get-prices";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";

const CHECKOUT_ERROR_PATH = "/checkout";

export default function AccountCheckoutClient({
  email,
  profile,
  addresses,
}: {
  email: string;
  profile: CustomerProfileType | null;
  addresses: UserAddressType[];
}) {
  const { basket, productsInBasket } = useBasketStore();

  const totalPrice = useMemo(
    () =>
      basket.reduce((acc, item) => {
        const product = productsInBasket.find((p) => p.id === item.productId);
        return acc + (product ? Number(product.price) * item.quantity : 0);
      }, 0),
    [basket, productsInBasket],
  );

  const defaultAddress =
    addresses.find((a) => a.isDefaultShipping) ?? addresses[0] ?? null;

  const [deliveryMethod, setDeliveryMethod] = useState(
    profile?.defaultDeliveryMethod ?? "CONSEGNA_CORRIERE",
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentProviderTypes | "">(
    profile?.defaultPaymentMethod ?? "",
  );

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
  const isPickup = deliveryMethod === "RITIRO_NEGOZIO";
  const deliveryPrice = getDeliveryPrice(totalPrice);

  const billingComplete = profile
    ? profile.clientType === "azienda"
      ? Boolean(profile.ragioneSociale && profile.partitaIva)
      : Boolean(profile.nome && profile.cognome)
    : false;
  const profileComplete = Boolean(profile?.numeroTelefono) && billingComplete;
  const needsAddress = !isPickup && !selectedAddress;
  const cartEmpty = basket.length === 0 || productsInBasket.length === 0;
  const canPay =
    !cartEmpty && profileComplete && !needsAddress && Boolean(paymentMethod);

  const dataFirstStep = useMemo<CheckoutTypesDataFirstStep>(
    () => ({
      email,
      numeroTelefono: profile?.numeroTelefono ?? "",
      clientType: profile?.clientType ?? "privato",
      requestInvoice: profile?.requestInvoiceDefault ?? false,
      orderStatus: "PENDING_PAYMENT",
      deliveryMethod,
      deliveryPrice,
      userId: null,
      nome: profile?.nome ?? null,
      cognome: profile?.cognome ?? null,
      indirizzo: isPickup ? null : (selectedAddress?.indirizzo ?? null),
      numeroCivico: isPickup ? null : (selectedAddress?.numeroCivico ?? null),
      citta: isPickup ? null : (selectedAddress?.citta ?? null),
      cap: isPickup ? null : (selectedAddress?.cap ?? null),
      nazione: isPickup ? null : (selectedAddress?.nazione ?? "IT"),
      provinciaRegione: isPickup ? null : (selectedAddress?.provinciaRegione ?? null),
      codiceFiscale: profile?.codiceFiscale ?? null,
      referenteContatto: profile?.referenteContatto ?? null,
      ragioneSociale: profile?.ragioneSociale ?? null,
      partitaIva: profile?.partitaIva ?? null,
      pecAzzienda: profile?.pecAzzienda ?? null,
      codiceUnico: profile?.codiceUnico ?? null,
      paymentOrderID: null,
      trackingNumber: null,
      carrier: null,
      shippedAt: null,
      deliveredAt: null,
    }),
    [email, profile, deliveryMethod, deliveryPrice, isPickup, selectedAddress],
  );

  const dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna = {
    deliveryAdress: null,
    sameAsBilling: true,
  };

  const dataCheckoutStepPagamento = paymentMethod
    ? {
        paymentMethod,
        title: PAYMENT_METHODS.find((m) => m.paymentMethod === paymentMethod)?.title ?? paymentMethod,
      }
    : {};

  const widgetProps = {
    totalPrice,
    basket,
    productsInBasket,
    dataFirstStep,
    dataCheckoutStepConsegna,
    dataCheckoutStepPagamento,
    paymentErrorPath: CHECKOUT_ERROR_PATH,
  };

  const commission = getPaymentCommission({
    amount: getTotalPriceToPay({ totalPrice, deliveryMetod: deliveryMethod }),
    paymentMethod: paymentMethod || undefined,
  });
  const grandTotal = getTotalPriceToPayWithCommission({
    totalPrice,
    deliveryMetod: deliveryMethod,
    paymentMethod: paymentMethod || undefined,
  });

  if (cartEmpty) {
    return (
      <div className="container flex flex-col items-start gap-4 py-10">
        <h1 className="H2">Il tuo carrello è vuoto</h1>
        <Link href="/catalogo" className="rounded-sm bg-yellow-500 px-4 py-2 font-medium text-black">
          Vai al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="H2">Completa l&apos;ordine</h1>

      <section className="rounded-sm border border-stroke-grey">
        <h2 className="H5 border-b border-stroke-grey p-4">Il tuo ordine</h2>
        <ul>
          {basket.map((item) => {
            const product = productsInBasket.find((p) => p.id === item.productId);
            if (!product) return null;
            return (
              <li
                key={item.productId}
                className="flex items-center justify-between gap-4 border-b border-stroke-grey p-4 last:border-b-0"
              >
                <span>
                  {product.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  {(Number(product.price) * item.quantity).toFixed(2)} €
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-sm border border-stroke-grey p-4">
        <h2 className="H5">Consegna</h2>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deliveryMethod"
            checked={deliveryMethod === "CONSEGNA_CORRIERE"}
            onChange={() => setDeliveryMethod("CONSEGNA_CORRIERE")}
          />
          Corriere ({deliveryPrice === 0 ? "gratuita" : `${deliveryPrice.toFixed(2)} €`})
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deliveryMethod"
            checked={isPickup}
            onChange={() => setDeliveryMethod("RITIRO_NEGOZIO")}
          />
          Ritiro in negozio (Avellino, gratuito)
        </label>

        {!isPickup && (
          <div className="mt-2 flex flex-col gap-2">
            {addresses.length === 0 ? (
              <p className="helper_text">
                Nessun indirizzo salvato.{" "}
                <Link href="/account/indirizzi" className="text-yellow-500 underline">
                  Aggiungi un indirizzo
                </Link>
              </p>
            ) : (
              addresses.map((address) => (
                <label key={address.id} className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <span className="helper_text">
                    {address.label ? `${address.label} — ` : ""}
                    {address.indirizzo} {address.numeroCivico}, {address.cap} {address.citta} (
                    {address.provinciaRegione})
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-sm border border-stroke-grey p-4">
        <div className="flex items-center justify-between">
          <h2 className="H5">Fatturazione</h2>
          <Link href="/account/profilo" className="text-yellow-500 text-sm underline">
            Modifica nel profilo
          </Link>
        </div>
        {profileComplete ? (
          <p className="helper_text">
            {profile?.clientType === "azienda"
              ? profile?.ragioneSociale
              : `${profile?.nome ?? ""} ${profile?.cognome ?? ""}`.trim()}
            <br />
            {email} · {profile?.numeroTelefono}
            {profile?.partitaIva ? <> · P. IVA {profile.partitaIva}</> : null}
          </p>
        ) : (
          <p className="helper_text text-red-400">
            Completa i tuoi dati di fatturazione nel{" "}
            <Link href="/account/profilo" className="underline">
              profilo
            </Link>{" "}
            per procedere.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-sm border border-stroke-grey p-4">
        <h2 className="H5">Pagamento</h2>
        {PAYMENT_METHODS.map((method) => (
          <label key={method.paymentMethod} className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === method.paymentMethod}
              onChange={() => setPaymentMethod(method.paymentMethod)}
            />
            {method.title}
            {method.paymentMethod === "paypal" && (
              <span className="text-yellow-500">{PAYPAL_COMMISSION_LABEL}</span>
            )}
          </label>
        ))}
      </section>

      <section className="flex flex-col gap-3 self-end text-right">
        {commission > 0 && (
          <p className="helper_text text-yellow-500">
            {PAYPAL_COMMISSION_LABEL}: {commission.toFixed(2)} €
          </p>
        )}
        <p className="text-lg font-medium">Totale: {grandTotal.toFixed(2)} €</p>
      </section>

      <section className={clsx("rounded-sm border border-stroke-grey p-4", !canPay && "opacity-70")}>
        {needsAddress && (
          <p className="helper_text mb-3 text-red-400">Seleziona o aggiungi un indirizzo di consegna.</p>
        )}
        {!paymentMethod && (
          <p className="helper_text mb-3">Seleziona un metodo di pagamento.</p>
        )}

        {canPay && paymentMethod === "paypal" && <PayPalPaymentWidget {...widgetProps} />}
        {canPay && paymentMethod === "sumup" && <SumUpWidget {...widgetProps} />}
        {canPay && paymentMethod === "klarna" && <KlarnaPaymentWidget {...widgetProps} />}
        {canPay && paymentMethod === "bonifico" && <BonificoPaymentWidget {...widgetProps} />}
      </section>
    </div>
  );
}
