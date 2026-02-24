"use client";

import Script from "next/script";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createSumUpCheckout } from "@/app/actions/sumup/action";
import { createOrderAction } from "@/app/actions/orders/create-order";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { deleteOrderByOrderId } from "@/app/actions/orders/delete-order";
import { sendMailOrders } from "@/app/actions/mail/mail-orders";
import { sendTelegramMessage } from "@/app/actions/telegram/send-message";

import { PAGES } from "@/types/pages.types";
import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";
import { getTotalPriceToPay } from "@/utils/get-prices";
import { makeOrderNumber } from "@/utils/order-number";
import { ulid } from "ulid";
import { updateOrderInfoByOrderIDAction } from "@/app/actions/orders/udate-order-info";

type CreatedOrderRef = {
  orderId: string;
  orderNumber: string;
};

export default function SumUpModalButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { totalPrice, dataCheckoutStepConsegna, dataFirstStep, basket } = useCheckoutStore();
  const { productsInBasket } = useBasketStore();

  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const createdRef = useRef<CreatedOrderRef | null>(null);
  const didNotifyRef = useRef(false);

  const [internalOrderNumber] = useState(() => makeOrderNumber("OS"));
  const [internalOrderId] = useState(() => ulid());

  const priceToPay = totalPrice
    ? getTotalPriceToPay({
        totalPrice,
        deliveryMetod: dataFirstStep.deliveryMethod,
      })
    : 0;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setCheckoutId(null);
    if (containerRef.current) containerRef.current.innerHTML = "";
  };

  useEffect(() => {
    if (!open || !checkoutId) return;

    if (!window.SumUpCard) {
      toast.error("SumUp non disponibile, riprova.");

      (() => close())();
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    window.SumUpCard.mount({
      id: "sumUpIdContainer",
      checkoutId,
      onResponse: async (type, body) => {
        if (type === "success" || body?.status === "PAID") {
          const created = createdRef.current;
          if (!created) return;

          try {
            await updateOrderPaymentAction({
              orderNumber: created.orderNumber,
              data: {
                status: "SUCCESS",
                providerOrderId: checkoutId,
              },
            });
            await updateOrderInfoByOrderIDAction({
              orderId: created.orderId,
              dataToUpdate: { orderStatus: "PAID" },
            });

            if (!didNotifyRef.current) {
              didNotifyRef.current = true;

              await sendMailOrders({
                orderNumber: created.orderNumber,
                customerData: dataFirstStep,
                dataCheckoutStepConsegna,
                dataCheckoutStepPagamento: {
                  paymentMethod: "sumup",
                  title: "SumUp",
                },
                productsInBasket,
                bascket: basket,
              });

              await sendTelegramMessage({
                orderNumber: created.orderNumber,
                orderId: created.orderId,
                customerDisplayName:
                  `${dataFirstStep.nome ?? ""} ${dataFirstStep.cognome ?? ""}`.trim() || "Cliente",
                total: priceToPay.toString(),
                paymentMethod: "SumUp",
                deliveryMethod: dataFirstStep.deliveryMethod,
                email: dataFirstStep.email,
                numeroTelefono: dataFirstStep.numeroTelefono,
              });
            }

            close();
            router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${created.orderNumber}`);
          } catch (e) {
            console.error(e);
            toast.error("Errore post pagamento");
          }
        }
      },
    });
  }, [
    open,
    checkoutId,
    router,
    dataFirstStep,
    basket,
    productsInBasket,
    priceToPay,
    dataCheckoutStepConsegna,
  ]);

  const openAndCreate = async () => {
    if (!totalPrice || priceToPay <= 0) return;

    const created = await createOrderAction({
      customOrderNumberId: {
        id: internalOrderId,
        number: internalOrderNumber,
      },
      sendMessages: false,
      dataFirstStep,
      dataCheckoutStepConsegna,
      basket,
      productsInBasket,
      paymentData: {
        provider: "sumup",
        status: "CREATED",
        currency: "EUR",
        amount: priceToPay.toString(),
        providerOrderId: null,
        notes: null,
      },
    });

    if (!created?.success || !created.orderId) {
      toast.error(`Errore: ${created?.error ?? ""}`);
      return;
    }

    createdRef.current = {
      orderId: created.orderId,
      orderNumber: internalOrderNumber,
    };

    startTransition(async () => {
      setOpen(true);

      const checkoutReference = `${internalOrderNumber}-TRY-${attempt}`;
      setAttempt((p) => p + 1);

      const checkout = await createSumUpCheckout({
        orderNumber: internalOrderNumber,
        amount: priceToPay,
        checkout_reference: checkoutReference,
        description: `Order #${internalOrderNumber}`,
      });

      if (!checkout.success) {
        toast.error("Prova più tardi");

        if (createdRef.current) {
          await deleteOrderByOrderId({ id: createdRef.current.orderId });
          createdRef.current = null;
        }

        close();
        return;
      }
      toast.success("Aprendo pagamento…");
      await updateOrderPaymentAction({
        orderNumber: internalOrderNumber,
        data: {
          providerOrderId: checkout.data.id,
        },
      });

      setCheckoutId(checkout.data.id);
    });
  };

  return (
    <>
      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        strategy="afterInteractive"
      />

      <button
        type="button"
        onClick={openAndCreate}
        disabled={pending}
        className="w-full rounded-xl bg-[#F2C94C] px-6 py-3 font-semibold text-black disabled:opacity-60"
      >
        {pending ? "Apro…" : "Paga e procedi avanti"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-1000 flex justify-center overflow-y-scroll bg-black/60 py-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="relative w-full max-w-2xl shadow-2xl">
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 rounded-lg px-3 py-1 text-sm text-black/70 hover:bg-black/5"
              aria-label="Chiudi"
            >
              ✕
            </button>
            <div id="sumUpIdContainer" ref={containerRef} className="pb-4" />
          </div>
        </div>
      )}
    </>
  );
}
