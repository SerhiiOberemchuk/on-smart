"use client";

import RiepilogoDatiConsegna from "./RepilogoDatiConsegna";
import RiepilogoDatiCliente from "./RiepilogoDatiCliente";
import RiepilogoDatiPagamento from "./RiepilogoPagamento";
import { useCheckoutStore } from "@/store/checkout-store";
import KlarnaPaymentWidget from "@/components/pagamento/klarna/KlarnaPaymentWidget";
import PayPalPaymentWidget from "@/components/pagamento/paypal/PayPalPaymentWidget";
import SumUpWidget from "@/components/pagamento/sumup/SumUpWidget";
import BonificoPaymentWidget from "@/components/pagamento/bonifico/BonificoPaymentWidget";

export default function CheckouteStep4Riepilogo() {
  const { dataCheckoutStepPagamento } = useCheckoutStore();

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
      {dataCheckoutStepPagamento.paymentMethod === "sumup" && (
        <div className="mt-4">
          <p className="mb-2 font-medium">Procedi con il pagamento con carta qui sotto:</p>
          <SumUpWidget />
        </div>
      )}
      {dataCheckoutStepPagamento.paymentMethod === "bonifico" && <BonificoPaymentWidget />}
    </div>
  );
}
