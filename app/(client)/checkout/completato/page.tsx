"use client";

import RiepilogoDatiConsegna from "@/components/CheckoutPagesComponents/components/RepilogoDatiConsegna";
import RiepilogoDatiCliente from "@/components/CheckoutPagesComponents/components/RiepilogoDatiCliente";
import RiepilogoDatiPagamento from "@/components/CheckoutPagesComponents/components/RiepilogoPagamento";
import icon_success from "@/assets/icons/icon_success.svg";
import Image from "next/image";
import { useEffect, useEffectEvent } from "react";
import { useCheckoutStore } from "@/store/checkout-store";
import { redirect } from "next/navigation";
import { useBasketStore } from "@/store/basket-store";

const dataFromCRM = {
  status: "completed",
  orderNumber: "123456",
  orderDate: "Sabato 11 Ottobre 2025",
  totalAmount: "126,20 €",
};

export default function CompletatoPage() {
  // const { clearAllCheckoutData, step } = useCheckoutStore();
  // const { removeAllBasket } = useBasketStore();
  // const clearStores = useEffectEvent(() => {
  //   if (dataFromCRM.status === "completed") {
  //     clearAllCheckoutData();
  //     removeAllBasket();
  //   }
  // });
  // useEffect(() => {
  //   clearStores();
  // }, []);
  // if (!step) redirect("/carrello");
  return (
    <section className="flex flex-col gap-4 rounded-sm bg-background p-4">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-2">
          <Image src={icon_success} alt="success icon" aria-label="success icon" />
          <h1 className="H3 text-green">Ordine Completato</h1>
        </div>
        <p className="btn_small">
          Numero ordine: <span className="body_R_20">{dataFromCRM.orderNumber}</span>
        </p>
        <p className="btn_small">
          Data dell`ordine: <span className="body_R_20">{dataFromCRM.orderDate}</span>
        </p>
        <p className="btn_small">
          Totale: <span className="body_R_20">{dataFromCRM.totalAmount}</span>
        </p>
        <p className="helper_text mt-2 w-full text-left text-text-grey">
          L`Ordine è stato correttamente inviato e verrà evaso il prima possibile. È stata inviata
          una e-mail di risposta che riporta tutte le informazioni sulla Spedizione e il Pagamento,
          oltre che il riepilogo dei dati appena inseriti.
        </p>
        <p className="helper_text mt-2 w-full text-left text-text-grey">
          Per tracciare l`acquisto, prendere nota del numero di riferimento Ordine.
        </p>
      </div>
      <RiepilogoDatiCliente />
      <RiepilogoDatiConsegna />
      <RiepilogoDatiPagamento />
    </section>
  );
}
