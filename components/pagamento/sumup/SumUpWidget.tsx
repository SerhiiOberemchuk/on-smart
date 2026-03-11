"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createSumUpCheckout, deactivateCheckoutSumUp } from "@/app/actions/sumup/action";
import { createOrderAction } from "@/app/actions/orders/create-order";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";

import { PAGES } from "@/types/pages.types";
import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";
import { getTotalPriceToPay } from "@/utils/get-prices";
import { SUM_UP_CONSTANTS } from "@/app/actions/sumup/sumup-constans";

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
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const createdRef = useRef<CreatedOrderRef | null>(null);

  const startingRef = useRef(false);

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

  const close = useCallback(async () => {
    if (checkoutId) {
      try {
        await deactivateCheckoutSumUp({ id: checkoutId });
      } catch (e) {
        console.error("Errore deactivate checkout:", e);
      }
    }

    setOpen(false);
    setCheckoutId(null);

    if (containerRef.current) containerRef.current.innerHTML = "";
  }, [checkoutId]);

  const redirectToSumUpErrorState = useCallback(
    (reason: string) => {
      toast.error(
        "Pagamento non riuscito. Prova piu tardi oppure scegli un altro metodo di pagamento.",
      );
      router.push(`${PAGES.CHECKOUT_PAGES.SUMMARY}?payment_error=${encodeURIComponent(reason)}`);
    },
    [router],
  );

  useEffect(() => {
    if (!open || !checkoutId) return;

    if (!window.SumUpCard) {
      toast.error("SumUp non disponibile, riprova.");
      void close();
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    window.SumUpCard.mount({
      id: "sumUpIdContainer",
      checkoutId,
      onResponse: async (type, body) => {
        if (isProcessingResponse) return;
        setIsProcessingResponse(true);

        try {
          console.log("SumUp response:", { type, body });
          const created = createdRef.current;
          if (!created) {
            redirectToSumUpErrorState("sumup_missing_order_ref");
            return;
          }

          const status = body?.status;

          if (type === "error") {
            try {
              await updateOrderPaymentAction({
                orderNumber: created.orderNumber,
                data: {
                  status: "FAILED",
                  providerOrderId: checkoutId,
                  notes: "SumUp widget returned error",
                },
              });

              await deactivateCheckoutSumUp({ id: checkoutId });
            } catch (e) {
              console.error("Errore post-failed:", e);
            }

            await close();
            redirectToSumUpErrorState("sumup_widget_error");
            return;
          }

          if (type === "success" || status === "PAID" || status === "PENDING") {
            await updateOrderPaymentAction({
              orderNumber: created.orderNumber,
              data: {
                status: "PENDING",
                providerOrderId: checkoutId,
                notes: `SumUp widget response: ${String(status ?? type)}`,
              },
            });

            await close();
            router.push(
              `${PAGES.CHECKOUT_PAGES.COMPLETED}/${created.orderNumber}/sumup?${SUM_UP_CONSTANTS.SEARCH_PARAM_CHECKOUT_ID.TITLE}=${checkoutId}&order_id=${created.orderId}`,
            );
            return;
          }

          await close();
          redirectToSumUpErrorState("sumup_unexpected_response");
        } catch (e) {
          console.error("SumUp response handling error:", e);
          await close();
          redirectToSumUpErrorState("sumup_response_handler_error");
        } finally {
          setIsProcessingResponse(false);
        }
      },
    });
  }, [
    open,
    checkoutId,
    close,
    isProcessingResponse,
    redirectToSumUpErrorState,
  ]);

  const openAndCreate = async () => {
    if (startingRef.current) return;
    if (!totalPrice || priceToPay <= 0) return;

    startingRef.current = true;

    try {
      if (!createdRef.current) {
        const created = await createOrderAction({
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

        if (!created?.success || !created.orderId || !created.orderNumber) {
          toast.error(`Errore: ${String(created?.error ?? "")}`);
          return;
        }

        createdRef.current = {
          orderId: created.orderId,
          orderNumber: created.orderNumber,
        };
      }

      startTransition(async () => {
        setIsProcessingResponse(false);
        setOpen(true);

        const created = createdRef.current!;
        const checkoutReference = `${created.orderNumber}-TRY-${attempt}`;
        setAttempt((p) => p + 1);

        const checkout = await createSumUpCheckout({
          orderId: created.orderId,
          orderNumber: created.orderNumber,
          amount: priceToPay,
          checkout_reference: checkoutReference,
          description: `Order #${created.orderNumber}`,
        });

        if (!checkout.success) {
          toast.error("Prova piu tardi");
          await close();
          redirectToSumUpErrorState("sumup_checkout_creation_failed");
          return;
        }

        await updateOrderPaymentAction({
          orderNumber: created.orderNumber,
          data: { providerOrderId: checkout.data.id },
        });

        setCheckoutId(checkout.data.id);
      });
    } finally {
      startingRef.current = false;
    }
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
        disabled={pending || startingRef.current || open || isProcessingResponse}
        className="w-full rounded-xl bg-[#F2C94C] px-6 py-3 font-semibold text-black disabled:opacity-60"
      >
        {pending ? "Apro..." : "Paga e procedi avanti"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-1000 flex justify-center overflow-y-scroll bg-black/60 py-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) void close();
          }}
        >
          <div className="relative w-full max-w-2xl shadow-2xl">
            <button
              type="button"
              onClick={() => void close()}
              className="absolute top-3 right-3 rounded-lg px-3 py-1 text-sm text-black/70 hover:bg-black/5"
              aria-label="Chiudi"
            >
              x
            </button>

            <div id="sumUpIdContainer" ref={containerRef} className="pb-4" />
          </div>
        </div>
      )}
    </>
  );
}
