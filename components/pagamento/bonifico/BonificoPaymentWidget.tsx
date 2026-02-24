"use client";

import { createOrderAction } from "@/app/actions/orders/create-order";
import ButtonYellow from "@/components/BattonYellow";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBasketStore } from "@/store/basket-store";
import { toast } from "react-toastify";

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
        sendMessages: true,
        dataCheckoutStepConsegna,
        dataFirstStep,
        basket,
        productsInBasket,
        paymentData: {
          amount: totalPrice.toFixed(2),
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
    if (stateOrder.isMailSended) {
      toast.success("Order createt e messagio e inviato dal cliente");
    }
  }, [stateOrder.isMailSended]);

  useEffect(() => {
    if (!stateOrder.success || !stateOrder.orderNumber) return;
    if (didRunRef.current) return;
    didRunRef.current = true;
    const clear = setTimeout(() => {
      clearAllCheckoutData();
      clearBasketStore();
    }, 1000);
    router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${stateOrder.orderNumber}`);
    return () => clearTimeout(clear);
  }, [router, stateOrder.success, stateOrder.orderNumber, clearAllCheckoutData, clearBasketStore]);

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
