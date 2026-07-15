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
  getDeliveryPrice,
  getPaymentCommission,
  getPaymentCommissionLabel,
  getTotalPriceToPay,
  getTotalPriceToPayWithCommission,
} from "@/utils/get-prices";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CheckoutReviewSection from "./components/CheckoutReviewSection";
import ConsegnaSection from "./components/ConsegnaSection";
import FatturazioneSection from "./components/FatturazioneSection";

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
  const router = useRouter();
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
  const [requestInvoice, setRequestInvoice] = useState(
    profile?.requestInvoiceDefault ?? false,
  );

  // Fall back to the default address so an address added inline (after
  // router.refresh) is picked up without an extra click.
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? defaultAddress;
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
      requestInvoice,
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
    [email, profile, requestInvoice, deliveryMethod, deliveryPrice, isPickup, selectedAddress],
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

  // Collapsed "review" summaries for each section.
  const deliverySummary = isPickup
    ? "Ritiro in negozio (Avellino, gratuito)"
    : selectedAddress
      ? `Corriere (${deliveryPrice === 0 ? "gratuita" : `${deliveryPrice.toFixed(2)} €`}) · ${selectedAddress.indirizzo} ${selectedAddress.numeroCivico}, ${selectedAddress.cap} ${selectedAddress.citta}`
      : "Corriere · nessun indirizzo selezionato";

  const billingName =
    profile?.clientType === "azienda"
      ? profile?.ragioneSociale
      : `${profile?.nome ?? ""} ${profile?.cognome ?? ""}`.trim();
  const billingSummary = profileComplete
    ? `${billingName} · Fattura: ${requestInvoice ? "Sì" : "No"}`
    : "Completa i dati di fatturazione";

  const paymentTitle = paymentMethod
    ? (PAYMENT_METHODS.find((m) => m.paymentMethod === paymentMethod)?.title ?? paymentMethod)
    : null;
  const paymentCommissionLabel = getPaymentCommissionLabel(paymentMethod || undefined);
  const paymentSummary = paymentTitle ? (
    <span>
      {paymentTitle}
      {paymentCommissionLabel && (
        <span className="text-yellow-500"> {paymentCommissionLabel}</span>
      )}
    </span>
  ) : (
    "Nessun metodo di pagamento selezionato"
  );

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

      <CheckoutReviewSection title="Consegna" summary={deliverySummary} defaultOpen={needsAddress}>
        <ConsegnaSection
          deliveryMethod={deliveryMethod}
          onDeliveryMethodChange={setDeliveryMethod}
          deliveryPrice={deliveryPrice}
          addresses={addresses}
          selectedAddressId={selectedAddress?.id ?? null}
          onSelectAddress={setSelectedAddressId}
          onAddressSaved={() => router.refresh()}
        />
      </CheckoutReviewSection>

      <CheckoutReviewSection
        title="Fatturazione"
        summary={billingSummary}
        defaultOpen={!profileComplete}
      >
        <FatturazioneSection
          email={email}
          profile={profile}
          profileComplete={profileComplete}
          requestInvoice={requestInvoice}
          onRequestInvoiceChange={setRequestInvoice}
          onProfileSaved={() => router.refresh()}
        />
      </CheckoutReviewSection>

      <CheckoutReviewSection
        title="Pagamento"
        summary={paymentSummary}
        defaultOpen={!paymentMethod}
      >
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((method) => (
            <label key={method.paymentMethod} className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === method.paymentMethod}
                onChange={() => setPaymentMethod(method.paymentMethod)}
              />
              {method.title}
              {getPaymentCommissionLabel(method.paymentMethod) && (
                <span className="text-yellow-500">
                  {getPaymentCommissionLabel(method.paymentMethod)}
                </span>
              )}
            </label>
          ))}
        </div>
      </CheckoutReviewSection>

      <section className="flex flex-col gap-3 self-end text-right">
        {commission > 0 && (
          <p className="helper_text text-yellow-500">
            {getPaymentCommissionLabel(paymentMethod || undefined)}: {commission.toFixed(2)} €
          </p>
        )}
        <p className="text-lg font-medium">Totale: {grandTotal.toFixed(2)} €</p>
      </section>

      <section className={clsx("rounded-sm border border-stroke-grey p-4", !canPay && "opacity-70")}>
        {needsAddress && (
          <p className="helper_text mb-3 text-red-400">Seleziona o aggiungi un indirizzo di consegna.</p>
        )}
        {!profileComplete && (
          <p className="helper_text mb-3 text-red-400">Completa i dati di fatturazione per procedere.</p>
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
