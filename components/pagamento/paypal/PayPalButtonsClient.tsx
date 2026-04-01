"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalButtons, PayPalMessages, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import type { PayPalButtonsComponentOptions } from "@paypal/paypal-js";

import { capturePayPalOrderAction, createPayPalOrderAction } from "@/app/actions/pay-pay/pay-pal";
import { createOrderAction } from "@/app/actions/orders/create-order";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { deleteOrderByOrderId } from "@/app/actions/orders/delete-order";

import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";
import { PAGES } from "@/types/pages.types";
import { getTotalPriceToPay } from "@/utils/get-prices";
import { makeOrderNumber } from "@/utils/order-number";
import { ulid } from "ulid";
import { updateOrderInfoByOrderIDAction } from "@/app/actions/orders/udate-order-info";
import { notifyOrderById } from "@/app/actions/notify-order-by-id/notify-order-by-id";

type Props = Pick<PayPalButtonsComponentOptions, "message" | "fundingSource" | "style">;

type CreatedOrderRef = {
  orderId: string;
  orderNumber: string;
  providerOrderId?: string | null;
};

export default function PayPalButtonsClient(props: Props) {
  const router = useRouter();
  const [{ isPending: isSdkPending }] = usePayPalScriptReducer();

  const { totalPrice, dataCheckoutStepConsegna, basket, dataFirstStep, dataCheckoutStepPagamento } =
    useCheckoutStore();
  const { productsInBasket } = useBasketStore();

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
      router.push(`${PAGES.CHECKOUT_PAGES.SUMMARY}?payment_error=${encodeURIComponent(reason)}`);
    },
    [router],
  );

  const redirectToPayPalPendingReviewState = useCallback(() => {
    router.push(
      `${PAGES.CHECKOUT_PAGES.SUMMARY}?payment_error=${encodeURIComponent("paypal_paid_persist_failed")}`,
    );
  }, [router]);

  useEffect(() => {
    if (!totalPrice) return;

    setShowMessages(false);

    const next = getTotalPriceToPay({
      totalPrice,
      deliveryMetod: dataFirstStep.deliveryMethod,
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
        {...props}
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

          const cap = await capturePayPalOrderAction({
            orderId: ppOrderId,
            referenceId,
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

          const paymentPersist = await updateOrderPaymentAction({
            orderNumber: referenceId,
            data: { status: "PAYED", providerOrderId: ppOrderId, notes: null },
          });

          if (!paymentPersist.success) {
            console.error("updateOrderPaymentAction SUCCESS after capture ok:", paymentPersist);
            resetDraftOrderIdentity();
            redirectToPayPalPendingReviewState();
            return;
          }

          const orderPersist = await updateOrderInfoByOrderIDAction({
            orderId: created.orderId,
            dataToUpdate: { orderStatus: "PAID" },
          });

          if (!orderPersist.success) {
            console.error("updateOrderInfoByOrderIDAction after PayPal capture ok:", orderPersist);
            resetDraftOrderIdentity();
            redirectToPayPalPendingReviewState();
            return;
          }

          if (!didNotifyRef.current) {
            didNotifyRef.current = true;

            try {
              await notifyOrderById({
                orderId: created.orderId,
              });
            } catch (e) {
              console.error("notifyOrderById failed:", e);
            }
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
