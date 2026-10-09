"use client";

import SumUpPaymentDialog from "@/components/pagamento/sumup/SumUpPaymentDialog";
import InlineSpinner from "@/components/InlineSpinner";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createSumUpCheckout, deactivateCheckoutSumUp } from "@/app/actions/sumup/action";
import { createOrderAction } from "@/app/actions/orders/create-order";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";

import { PAGES } from "@/types/pages.types";
import type { PaymentWidgetData } from "@/types/payment-widget.types";
import { getTotalPriceToPay } from "@/utils/get-prices";
import { SUM_UP_CONSTANTS } from "@/app/actions/sumup/sumup-constans";

type CreatedOrderRef = {
  orderId: string;
  orderNumber: string;
};

const PERSISTENT_PAYMENT_TOAST_OPTIONS = {
  autoClose: false,
  closeOnClick: true,
} as const;

export default function SumUpModalButton({
  totalPrice,
  basket,
  productsInBasket,
  dataFirstStep,
  dataCheckoutStepConsegna,
  paymentErrorPath,
}: PaymentWidgetData & { paymentErrorPath: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sdkState, setSdkState] = useState<"loading" | "ready" | "error">("loading");

  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const createdRef = useRef<CreatedOrderRef | null>(null);

  const startingRef = useRef(false);
  const closingRef = useRef(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
    if (closingRef.current) return;
    closingRef.current = true;
    setIsClosing(true);
    try {
      if (checkoutId) await deactivateCheckoutSumUp({ id: checkoutId });
    } catch (error) {
      console.error("Errore deactivate checkout:", error);
    } finally {
      setOpen(false);
      setCheckoutId(null);
      if (containerRef.current) containerRef.current.innerHTML = "";
      closingRef.current = false;
      setIsClosing(false);
    }
  }, [checkoutId]);

  const redirectToSumUpErrorState = useCallback(
    (reason: string) => {
      toast.error(
        "Pagamento non riuscito. Prova piu tardi oppure scegli un altro metodo di pagamento.",
        PERSISTENT_PAYMENT_TOAST_OPTIONS,
      );
      router.push(`${paymentErrorPath}?payment_error=${encodeURIComponent(reason)}`);
    },
    [router, paymentErrorPath],
  );

  useEffect(() => {
    if (!open || !checkoutId) return;

    if (!window.SumUpCard) return;

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
  }, [open, checkoutId, close, isProcessingResponse, redirectToSumUpErrorState, router]);

  const openAndCreate = async () => {
    if (startingRef.current) return;
    if (sdkState !== "ready" || !window.SumUpCard) {
      toast.error("SumUp non disponibile, riprova.", PERSISTENT_PAYMENT_TOAST_OPTIONS);
      return;
    }
    if (!totalPrice || priceToPay <= 0) return;

    startingRef.current = true;
    setIsStarting(true);

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
          toast.error(`Errore: ${String(created?.error ?? "")}`, PERSISTENT_PAYMENT_TOAST_OPTIONS);
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
          toast.error("Prova piu tardi", PERSISTENT_PAYMENT_TOAST_OPTIONS);
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
      setIsStarting(false);
    }
  };

  return (
    <>
      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        strategy="afterInteractive"
        onReady={() => setSdkState(window.SumUpCard ? "ready" : "error")}
        onError={() => setSdkState("error")}
      />

      <button
        type="button"
        onClick={openAndCreate}
        disabled={
          sdkState !== "ready" || pending || isStarting || open || isProcessingResponse || isClosing
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F2C94C] px-6 py-3 font-semibold text-black disabled:pointer-events-none disabled:opacity-60"
      >
        {(sdkState === "loading" || pending || isStarting || isProcessingResponse || isClosing) && (
          <InlineSpinner />
        )}
        {sdkState === "error"
          ? "Pagamento non disponibile. Ricarica la pagina."
          : sdkState === "loading"
            ? "Caricamento pagamento..."
            : isProcessingResponse
              ? "Verifica del pagamento in corso..."
              : open
                ? "Finestra di pagamento aperta..."
                : pending || isStarting
                  ? "Preparazione del pagamento..."
                  : "Paga e procedi avanti"}
      </button>

      {open && (
        <SumUpPaymentDialog
          isProcessingResponse={isProcessingResponse}
          isClosing={isClosing}
          onClose={close}
          containerRef={containerRef}
        />
      )}
    </>
  );
}
