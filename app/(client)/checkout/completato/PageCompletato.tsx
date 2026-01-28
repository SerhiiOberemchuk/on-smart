"use client";

import { useEffect, useState, useRef } from "react";
import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";
import { redirect } from "next/navigation";
import { formatOrderDateIT } from "@/utils/formatOrderDateIT";
import Image from "next/image";
import icon_success from "@/assets/icons/icon_success.svg";

import RiepilogoDatiConsegna from "@/components/CheckoutPagesComponents/components/RepilogoDatiConsegna";
import RiepilogoDatiCliente from "@/components/CheckoutPagesComponents/components/RiepilogoDatiCliente";
import RiepilogoDatiPagamento from "@/components/CheckoutPagesComponents/components/RiepilogoPagamento";
import { sendMailOrders } from "@/app/actions/mail/orders";
import { InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";

export default function CompletatoPage() {
  const {
    clearAllCheckoutData,
    step,
    orderNumber,
    totalPrice,
    dataFirstStep,
    dataCheckoutStepConsegna,
    dataCheckoutStepPagamento,
  } = useCheckoutStore();
  const { removeAllBasket, productsInBasket, basket } = useBasketStore();

  useEffect(() => {
    async function sendOrderConfirmationEmail() {
      if (!orderNumber) return;
      if (!dataCheckoutStepConsegna.deliveryMethod) return;
      console.log("Start send email");

      const result = await sendMailOrders({
        orderNumber,
        customerData: dataFirstStep,
        dataCheckoutStepConsegna: dataCheckoutStepConsegna as InputsCheckoutStep2Consegna,
        dataCheckoutStepPagamento,
        productsInBasket,
        bascket: basket,
      });

      console.log(result);
    }
    sendOrderConfirmationEmail();
  }, [
    orderNumber,
    dataFirstStep,
    dataCheckoutStepConsegna,
    dataCheckoutStepPagamento,
    productsInBasket,
    basket,
  ]);

  const [snapshot] = useState({
    orderNumber,
    totalPrice,
    step,
    customer: { ...dataFirstStep },
    delivery: { ...dataCheckoutStepConsegna },
    payment: { ...dataCheckoutStepPagamento },
    date: formatOrderDateIT(),
  });

  const hasCleared = useRef(false);

  useEffect(() => {
    if (!snapshot.orderNumber || hasCleared.current) return;

    const t = setTimeout(() => {
      clearAllCheckoutData();
      removeAllBasket();
      sessionStorage.clear();
      localStorage.clear();
      hasCleared.current = true;
    }, 1000);

    return () => clearTimeout(t);
  }, [clearAllCheckoutData, removeAllBasket, snapshot.orderNumber]);

  if (!snapshot.step) {
    redirect("/carrello");
  }

  return (
    <section className="flex flex-col gap-4 rounded-sm bg-background p-4">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-2">
          <Image src={icon_success} alt="success icon" />
          <h1 className="H3 text-green">Ordine Completato</h1>
        </div>

        <p className="btn_small">
          Numero ordine: <span className="body_R_20">{snapshot.orderNumber}</span>
        </p>
        <p className="btn_small">
          Data dell`ordine: <span className="body_R_20">{snapshot.date}</span>
        </p>
        <p className="btn_small">
          Totale: <span className="body_R_20">{snapshot.totalPrice?.toFixed(2)} €</span>
        </p>

        <p className="helper_text mt-2 w-full text-left text-text-grey">
          L`Ordine è stato correttamente inviato...
        </p>
      </div>

      <RiepilogoDatiCliente isModifica={false} externalData={snapshot.customer} />
      <RiepilogoDatiConsegna
        isModifica={false}
        externalDataConsegna={snapshot.delivery}
        externalDataCustomer={snapshot.customer}
      />
      <RiepilogoDatiPagamento isModifica={false} externalDataPayment={snapshot.payment} />
    </section>
  );
}
