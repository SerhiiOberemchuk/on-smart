"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";

// import KlarnaScript from "./KlarnaScript";
import ButtonYellow from "@/components/BattonYellow";

import {
  createKlarnaSessionAction,
  KlarnaSessionResponseType,
} from "@/app/actions/klarna/create-session";
import { placeKlarnaOrder } from "@/app/actions/klarna/create-order";

import { createOrderAction } from "@/app/actions/orders/create-order";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { deleteOrderByOrderId } from "@/app/actions/orders/delete-order";

import { PAGES } from "@/types/pages.types";
import type { PaymentWidgetData } from "@/types/payment-widget.types";
import { getPaymentCommission, getTotalPriceToPay } from "@/utils/get-prices";
import { makeOrderNumber } from "@/utils/order-number";
import { ulid } from "ulid";

import { KlarnaAuthorizeResponse, KlarnaPaymentsLoadResponse } from "@/types/klarna";
import Script from "next/script";

const containerId = "klarna_container";
const currency = "EUR";
const PERSISTENT_PAYMENT_TOAST_OPTIONS = {
  autoClose: false,
  closeOnClick: true,
} as const;

type CreatedOrderRef = {
  orderId: string;
  orderNumber: string;
};

export default function KlarnaPaymentWidget({
  totalPrice,
  basket,
  productsInBasket,
  dataFirstStep,
  dataCheckoutStepConsegna,
  dataCheckoutStepPagamento,
  paymentErrorPath,
}: PaymentWidgetData & { paymentErrorPath: string }) {
  const router = useRouter();

  const [sessionData, setSessionData] = useState<KlarnaSessionResponseType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [orderNumber] = useState(() => makeOrderNumber("OS"));
  const [orderId] = useState(() => ulid());

  const createdRef = useRef<CreatedOrderRef | null>(null);
  const isCreatingRef = useRef(false);

  const { priceToPay, deliveryPrice, commission } = useMemo(() => {
    if (!totalPrice) return { priceToPay: 0, deliveryPrice: 0, commission: 0 };

    const base = getTotalPriceToPay({
      totalPrice,
      deliveryMetod: dataFirstStep.deliveryMethod,
    });
    const delivery = Number((base - totalPrice).toFixed(2));
    const klarnaCommission = Number(
      getPaymentCommission({ amount: base, paymentMethod: "klarna" }).toFixed(2),
    );

    return {
      priceToPay: Number((base + klarnaCommission).toFixed(2)),
      deliveryPrice: delivery,
      commission: klarnaCommission,
    };
  }, [totalPrice, dataFirstStep.deliveryMethod]);

  const selectedCategory = useMemo<string | null>(
    () => sessionData?.payment_method_categories?.[0]?.identifier ?? null,
    [sessionData],
  );

  const redirectToKlarnaErrorState = (reason: string) => {
    toast.error(
      "Pagamento Klarna non riuscito. Riprova piu tardi o scegli un altro metodo di pagamento.",
      PERSISTENT_PAYMENT_TOAST_OPTIONS,
    );
    router.push(`${paymentErrorPath}?payment_error=${encodeURIComponent(reason)}`);
  };

  const redirectToKlarnaPendingReviewState = () => {
    router.push(
      `${paymentErrorPath}?payment_error=${encodeURIComponent("klarna_paid_persist_failed")}`,
    );
  };

  const canPay = useMemo<boolean>(() => {
    return (
      priceToPay > 0 &&
      basket.length > 0 &&
      productsInBasket.length > 0 &&
      dataCheckoutStepPagamento.paymentMethod === "klarna"
    );
  }, [priceToPay, basket.length, productsInBasket.length, dataCheckoutStepPagamento.paymentMethod]);

  useEffect(() => {
    if (!canPay) return;

    (async () => {
      try {
        setLoadingSession(true);
        setError(null);

        const session = await createKlarnaSessionAction({
          orderNumber,
          dataFirstStep,
          dataCheckoutStepConsegna,
          productsInBasket,
          deliveryPrice,
          commission,
          basket,
        });
        if (session.error) {
          setError(session.error);
          console.error(session.error);
          return;
        }
        setSessionData(session);
      } catch (e) {
        console.error(e);
        setError("Errore nella creazione della sessione Klarna");
      } finally {
        setLoadingSession(false);
      }
    })();
  }, [
    canPay,
    orderNumber,
    dataFirstStep,
    dataCheckoutStepConsegna,
    productsInBasket,
    deliveryPrice,
    commission,
    basket,
  ]);

  useEffect(() => {
    if (!sessionData?.client_token || !selectedCategory) return;

    const interval = setInterval(() => {
      const klarna = window.Klarna;
      if (!klarna?.Payments) return;

      clearInterval(interval);

      klarna.Payments.init({ client_token: sessionData.client_token });

      klarna.Payments.load(
        {
          container: `#${containerId}`,
          payment_method_category: selectedCategory,
        },
        (res: KlarnaPaymentsLoadResponse) => {
          if (res.show_form === false) {
            setError("Klarna: metodo non disponibile");
          }
        },
      );
    }, 100);

    return () => clearInterval(interval);
  }, [sessionData?.client_token, selectedCategory]);

  const handleAuthorize = async (): Promise<void> => {
    if (!window.Klarna?.Payments || !selectedCategory || !canPay) return;
    if (isCreatingRef.current) return;

    isCreatingRef.current = true;
    setIsPaying(true);
    setError(null);

    const created = await createOrderAction({
      customOrderNumberId: { id: orderId, number: orderNumber },
      sendMessages: false,
      dataFirstStep,
      dataCheckoutStepConsegna,
      basket,
      productsInBasket,
      paymentData: {
        amount: String(priceToPay),
        provider: "klarna",
        status: "CREATED",
        providerOrderId: null,
        notes: null,
        currency,
      },
    });

    if (!created?.success || !created.orderId) {
      toast.error("Errore creazione ordine", PERSISTENT_PAYMENT_TOAST_OPTIONS);
      isCreatingRef.current = false;
      setIsPaying(false);
      return;
    }

    createdRef.current = { orderId: created.orderId, orderNumber };

    window.Klarna.Payments.authorize(
      { payment_method_category: selectedCategory },
      {},
      async (res: KlarnaAuthorizeResponse) => {
        try {
          if (!res.approved || !res.authorization_token) {
            const cancelUpdate = await updateOrderPaymentAction({
              orderNumber,
              data: {
                status: "CANCELED",
                notes: "Klarna authorization was not approved",
              },
            });
            if (!cancelUpdate.success) {
              console.error("Klarna cancel update failed:", cancelUpdate);
            }
            const rollback = await deleteOrderByOrderId({ id: created.orderId });
            if (!rollback.success) {
              console.error("Klarna rollback after authorization failure failed:", rollback);
            }
            redirectToKlarnaErrorState("klarna_authorization_not_approved");
            return;
          }

          const placedOrder = await placeKlarnaOrder({
            authorizationToken: res.authorization_token,
            orderNumber,
            internalOrderId: created.orderId,
            dataFirstStep,
            dataCheckoutStepConsegna,
            productsInBasket,
            deliveryPrice,
            commission,
            basket,
          });

          if (!placedOrder.success) {
            const failedUpdate = await updateOrderPaymentAction({
              orderNumber,
              data: {
                status: "FAILED",
                notes: `Klarna place order failed: ${placedOrder.error}`,
              },
            });
            if (!failedUpdate.success) {
              console.error("Klarna failed update after place-order failed:", failedUpdate);
            }
            const rollback = await deleteOrderByOrderId({ id: created.orderId });
            if (!rollback.success) {
              console.error("Klarna rollback after place-order failed:", rollback);
            }
            redirectToKlarnaErrorState("klarna_place_order_failed");
            return;
          }

          // placeKlarnaOrder persisted PAYED/PAID + notified server-side after
          // Klarna accepted the order. The client only reacts to the outcome.
          if (!placedOrder.persisted) {
            console.error("Klarna placed but order persistence failed:", orderNumber);
            redirectToKlarnaPendingReviewState();
            return;
          }

          if (placedOrder.redirectUrl) {
            window.location.assign(placedOrder.redirectUrl);
            return;
          }

          router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${orderNumber}`);
        } catch (e) {
          console.error(e);
          const runtimeFailedUpdate = await updateOrderPaymentAction({
            orderNumber,
            data: {
              status: "FAILED",
              notes: e instanceof Error ? e.message : "Unexpected Klarna payment error",
            },
          });
          if (!runtimeFailedUpdate.success) {
            console.error("Klarna runtime failed update failed:", runtimeFailedUpdate);
          }
          const rollback = await deleteOrderByOrderId({ id: created.orderId });
          if (!rollback.success) {
            console.error("Klarna rollback after runtime error failed:", rollback);
          }
          redirectToKlarnaErrorState("klarna_runtime_error");
        } finally {
          isCreatingRef.current = false;
          setIsPaying(false);
        }
      },
    );
  };

  return (
    <div className="space-y-4 py-5">
      <Script src="https://x.klarnacdn.net/kp/lib/v1/api.js" strategy="afterInteractive" />
      <h2 className="text-xl font-semibold">Pagamento con Klarna</h2>
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loadingSession ? (
        <div className="rounded-md border border-stroke-grey bg-background px-4 py-3 text-sm text-text-grey">
          Preparazione del pagamento Klarna in corso...
        </div>
      ) : null}
      <div id={containerId} className="min-h-[180px] rounded-md border bg-amber-50 p-3" />
      <ButtonYellow
        className={twMerge(
          "ml-auto",
          (!canPay || isPaying || loadingSession) && "cursor-not-allowed opacity-60",
        )}
        disabled={!canPay || isPaying || loadingSession}
        onClick={handleAuthorize}
      >
        {loadingSession
          ? "Preparazione Klarna..."
          : isPaying
            ? "Pagamento in corso..."
            : "Conferma e paga con Klarna"}
      </ButtonYellow>
    </div>
  );
}
