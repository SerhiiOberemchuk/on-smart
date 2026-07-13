"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalButtons, PayPalMessages, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import type { PayPalButtonsComponentOptions } from "@paypal/paypal-js";

import { capturePayPalOrderAction, createPayPalOrderAction } from "@/app/actions/pay-pay/pay-pal";
import { createOrderAction } from "@/app/actions/orders/create-order";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { deleteOrderByOrderId } from "@/app/actions/orders/delete-order";

import { PAGES } from "@/types/pages.types";
import type { PaymentWidgetData } from "@/types/payment-widget.types";
import { getTotalPriceToPayWithCommission } from "@/utils/get-prices";
import { makeOrderNumber } from "@/utils/order-number";
import { ulid } from "ulid";

type Props = Pick<PayPalButtonsComponentOptions, "message" | "fundingSource" | "style"> &
  PaymentWidgetData & { paymentErrorPath: string };

type CreatedOrderRef = {
  orderId: string;
  orderNumber: string;
  providerOrderId?: string | null;
};

export default function PayPalButtonsClient({
  totalPrice,
  basket,
  productsInBasket,
  dataFirstStep,
  dataCheckoutStepConsegna,
  dataCheckoutStepPagamento,
  paymentErrorPath,
  ...buttonProps
}: Props) {
  const router = useRouter();
  const [{ isPending: isSdkPending }] = usePayPalScriptReducer();

  const [priceToPay, setPriceToPay] = useState("0.00");
  const [showMessages, setShowMessages] = useState(false);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);

  const [internalOrderNumber, setInternalOrderNumber] = useState(() => makeOrderNumber("OS"));
  const [internalOrderId, setInternalOrderId] = useState(() => ulid());

  const createdDbRef = useRef<CreatedOrderRef | null>(null);

  const isCreatingRef = useRef(false);
  const didNotifyRef = useRef(false);

  const currency = "EUR";

  const resetDraftOrderIdentity = useCallback(() => {
    setInternalOrderNumber(makeOrderNumber("OS"));
    setInternalOrderId(ulid());
    createdDbRef.current = null;
    didNotifyRef.current = false;
    isCreatingRef.current = false;
    setIsProcessingPayPal(false);
  }, []);

  const redirectToPayPalErrorState = useCallback(
    (reason: string) => {
      router.push(`${paymentErrorPath}?payment_error=${encodeURIComponent(reason)}`);
    },
    [router, paymentErrorPath],
  );

  const redirectToPayPalPendingReviewState = useCallback(() => {
    router.push(
      `${paymentErrorPath}?payment_error=${encodeURIComponent("paypal_paid_persist_failed")}`,
    );
  }, [router, paymentErrorPath]);

  useEffect(() => {
    if (!totalPrice) return;

    setShowMessages(false);

    const next = getTotalPriceToPayWithCommission({
      totalPrice,
      deliveryMetod: dataFirstStep.deliveryMethod,
      paymentMethod: "paypal",
    }).toFixed(2);

    setPriceToPay(next);
    setShowMessages(true);
    resetDraftOrderIdentity();
  }, [totalPrice, dataFirstStep.deliveryMethod, basket, resetDraftOrderIdentity]);

  const canPay = useMemo(() => {
    const amount = Number(priceToPay);
    return (
      Number.isFinite(amount) &&
      amount > 0 &&
      basket.length > 0 &&
      productsInBasket.length > 0 &&
      dataCheckoutStepPagamento.paymentMethod === "paypal"
    );
  }, [priceToPay, basket.length, productsInBasket.length, dataCheckoutStepPagamento.paymentMethod]);

  if (!totalPrice) return <div>Errore nel caricamento del pagamento PayPal.</div>;

  return (
    <div className="bg-white px-2 pt-2">
      {isSdkPending ? <span className="animate-spin">Caricamento...</span> : null}

      <div className="py-3">
        {showMessages && canPay && (
          <PayPalMessages
            key={`pp-msg-${priceToPay}-${currency}`}
            forceReRender={[priceToPay, currency]}
            amount={priceToPay}
            currency={currency}
            style={{ layout: "flex", ratio: "8x1", color: "white" }}
          />
        )}
      </div>

      <PayPalButtons
        {...buttonProps}
        forceReRender={[priceToPay, currency]}
        disabled={!canPay || isSdkPending || isProcessingPayPal}
        createOrder={async () => {
          if (!canPay) throw new Error("PayPal createOrder blocked: invalid state");
          if (isCreatingRef.current) throw new Error("PayPal createOrder blocked: already creating");

          isCreatingRef.current = true;
          setIsProcessingPayPal(true);

          const created = await createOrderAction({
            customOrderNumberId: { id: internalOrderId, number: internalOrderNumber },
            sendMessages: false,
            dataCheckoutStepConsegna,
            dataFirstStep,
            basket,
            productsInBasket,
            paymentData: {
              amount: priceToPay,
              provider: "paypal",
              status: "CREATED",
              providerOrderId: null,
              notes: null,
              currency,
            },
          });

          if (!created?.success || !created.orderId || !created.orderNumber) {
            resetDraftOrderIdentity();
            throw new Error(`Create internal order failed: ${String(created?.error ?? "")}`);
          }

          const referenceId = created.orderNumber;

          createdDbRef.current = {
            orderId: created.orderId,
            orderNumber: referenceId,
            providerOrderId: null,
          };

          const pp = await createPayPalOrderAction({
            total: priceToPay,
            referenceId,
          });

          if (!pp.ok || !pp.orderId) {
            const rollback = await deleteOrderByOrderId({ id: created.orderId });
            if (!rollback.success) {
              console.error("Rollback deleteOrderByOrderId failed:", rollback);
            }
            resetDraftOrderIdentity();

            throw new Error(`Create PayPal order failed: ${String(pp.error ?? "")}`);
          }

          createdDbRef.current.providerOrderId = pp.orderId;

          const paymentCreateUpdate = await updateOrderPaymentAction({
            orderNumber: referenceId,
            data: { status: "CREATED", providerOrderId: pp.orderId },
          });

          if (!paymentCreateUpdate.success) {
            console.error("updateOrderPaymentAction after PayPal create failed:", paymentCreateUpdate);
          }

          isCreatingRef.current = false;

          return pp.orderId;
        }}
        onApprove={async (data) => {
          const ppOrderId = data.orderID;
          const created = createdDbRef.current;

          if (!ppOrderId || !created?.orderNumber) {
            resetDraftOrderIdentity();
            redirectToPayPalErrorState("paypal_missing_order_ref");
            return;
          }

          const referenceId = created.orderNumber;

          // Capture verifies the payment AND persists PAYED/PAID + notifies,
          // all server-side. The client only reacts to the outcome.
          const cap = await capturePayPalOrderAction({
            orderId: ppOrderId,
            referenceId,
            internalOrderId: created.orderId,
          });

          if (!cap.ok) {
            const failedUpdate = await updateOrderPaymentAction({
              orderNumber: referenceId,
              data: {
                status: "FAILED",
                providerOrderId: ppOrderId,
                notes: String(cap.error ?? ""),
              },
            });
            if (!failedUpdate.success) {
              console.error("updateOrderPaymentAction FAILED after capture fail:", failedUpdate);
            }
            resetDraftOrderIdentity();
            redirectToPayPalErrorState("paypal_capture_failed");
            return;
          }

          if (!cap.persisted) {
            // Payment succeeded but the server could not persist it — send the
            // customer to the pending-review state (never show a hard error).
            console.error("PayPal captured but order persistence failed:", referenceId);
            resetDraftOrderIdentity();
            redirectToPayPalPendingReviewState();
            return;
          }

          resetDraftOrderIdentity();
          router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${referenceId}`);
        }}
        onCancel={async () => {
          const created = createdDbRef.current;
          if (created?.orderId) {
            const rollback = await deleteOrderByOrderId({ id: created.orderId });
            if (!rollback.success) {
              console.error("deleteOrderByOrderId onCancel failed:", rollback);
            }
          }

          resetDraftOrderIdentity();
          redirectToPayPalErrorState("paypal_canceled");
        }}
        onError={async (err) => {
          const created = createdDbRef.current;
          if (created?.orderId) {
            const rollback = await deleteOrderByOrderId({ id: created.orderId });
            if (!rollback.success) {
              console.error("deleteOrderByOrderId onError failed:", rollback);
            }
          }

          console.error("PayPal error", err);
          resetDraftOrderIdentity();
          redirectToPayPalErrorState("paypal_runtime_error");
        }}
      />
    </div>
  );
}
