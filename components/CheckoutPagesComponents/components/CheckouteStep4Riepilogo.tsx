"use client";

import ButtonYellow from "@/components/BattonYellow";
import RiepilogoDatiConsegna from "./RepilogoDatiConsegna";
import RiepilogoDatiCliente from "./RiepilogoDatiCliente";
import RiepilogoDatiPagamento from "./RiepilogoPagamento";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import KlarnaPaymentWidget from "@/components/pagamento/klarna/KlarnaPaymentWidget";
import PayPalPaymentWidget from "@/components/pagamento/paypal/PayPalPaymentWidget";

export default function CheckouteStep4Riepilogo() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const { orderNumber, dataCheckoutStepPagamento } = useCheckoutStore();

  const handleConfirmOrder = () => {
    setIsButtonDisabled(true);
    if (
      dataCheckoutStepPagamento.paymentMethod === "klarna" ||
      dataCheckoutStepPagamento.paymentMethod === "paypal"
    )
      return;

    redirect(PAGES.CHECKOUT_PAGES.COMPLETED);
  };

  useEffect(() => {
    if (!orderNumber) {
      redirect(PAGES.MAIN_PAGES.HOME);
    }
  }, [orderNumber]);
  return (
    <div className="flex flex-col gap-6">
      <RiepilogoDatiCliente />
      <RiepilogoDatiConsegna />
      <RiepilogoDatiPagamento />

      {dataCheckoutStepPagamento.paymentMethod === "klarna" && (
        <div className="mt-4">
          <p className="mb-2 font-medium">Procedi con il pagamento Klarna qui sotto:</p>
          <KlarnaPaymentWidget />
        </div>
      )}
      {dataCheckoutStepPagamento.paymentMethod === "paypal" && (
        <div className="mt-4">
          <p className="mb-2 font-medium">Procedi con il pagamento PayPal qui sotto:</p>
          <PayPalPaymentWidget />
        </div>
      )}
      {dataCheckoutStepPagamento.paymentMethod === "card" && (
        <div className="mt-4">
          <p className="mb-2 font-medium">Procedi con il pagamento con carta qui sotto:</p>
          {/* Card Payment Widget Component */}
          <div>Card Payment Widget</div>
        </div>
      )}
      {dataCheckoutStepPagamento.paymentMethod === "bonifico" && (
        <ButtonYellow className="ml-auto" disabled={isButtonDisabled} onClick={handleConfirmOrder}>
          Conferma Ordine
        </ButtonYellow>
      )}
    </div>
  );
}
