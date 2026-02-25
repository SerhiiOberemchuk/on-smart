"use client";

import { createOrderAction } from "@/app/actions/orders/create-order";
import ButtonYellow from "@/components/BattonYellow";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBasketStore } from "@/store/basket-store";
import { toast } from "react-toastify";
import { notifyOrderById } from "@/app/actions/notify-order-by-id/notify-order-by-id";

export default function BonificoPaymentWidget() {
  const router = useRouter();
  const {
    dataCheckoutStepConsegna,
    dataFirstStep,
    basket,
    totalPrice,
    dataCheckoutStepPagamento,
    clearAllCheckoutData,
  } = useCheckoutStore();
  const { productsInBasket, clearBasketStore } = useBasketStore();

  const [stateOrder, actionOrder, pendingOrder] = useActionState(
    async () =>
      await createOrderAction({
        // sendMessages: true,
        dataCheckoutStepConsegna,
        dataFirstStep,
        basket,
        productsInBasket,
        paymentData: {
          amount:
            dataFirstStep.deliveryMethod === "CONSEGNA_CORRIERE"
              ? (totalPrice + dataFirstStep.deliveryPrice).toFixed(2)
              : totalPrice.toFixed(2),
          provider: dataCheckoutStepPagamento.paymentMethod!,
          status: "PENDING_BONIFICO",
          providerOrderId: null,
          notes: null,
          currency: "EUR",
        },
      }),
    { success: false, orderNumber: undefined, error: undefined },
  );
  const didRunRef = useRef(false);

  useEffect(() => {
    if (!stateOrder.success || !stateOrder.orderNumber) return;
    if (didRunRef.current) return;

    (async () => {
      try {
        await notifyOrderById({ orderId: stateOrder.orderId });
        toast.success(
          "Ordine creato con successo! Riceverai una email con i dettagli per il pagamento.",
        );
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    })();

    didRunRef.current = true;
    const clear = setTimeout(() => {
      clearAllCheckoutData();
      clearBasketStore();
    }, 1000);
    router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${stateOrder.orderNumber}`);
    return () => clearTimeout(clear);
  }, [
    router,
    stateOrder.success,
    stateOrder.orderNumber,
    clearAllCheckoutData,
    clearBasketStore,
    stateOrder.orderId,
  ]);

  useEffect(() => {
    if (stateOrder.error) console.error(stateOrder.error);
  }, [stateOrder.error]);

  return (
    <>
      <ButtonYellow
        className="ml-auto"
        disabled={pendingOrder}
        onClick={() => {
          startTransition(actionOrder);
        }}
      >
        {pendingOrder ? "Creazione..." : "Conferma Ordine"}
      </ButtonYellow>

      {/* {!pending && stateOrder.error ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null} */}
    </>
  );
}
