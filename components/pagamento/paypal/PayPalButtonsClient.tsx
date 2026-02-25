"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { toast } from "react-toastify";
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

  const [internalOrderNumber, setInternalOrderNumber] = useState(() => makeOrderNumber("OS"));
  const [internalOrderId, setInternalOrderId] = useState(() => ulid());

  const createdDbRef = useRef<CreatedOrderRef | null>(null);

  const isCreatingRef = useRef(false);

  const didNotifyRef = useRef(false);

  const currency = "EUR";

  useEffect(() => {
    if (!totalPrice) return;

    setShowMessages(false);

    const next = getTotalPriceToPay({
      totalPrice,
      deliveryMetod: dataFirstStep.deliveryMethod,
    }).toFixed(2);

    setPriceToPay(next);
    setShowMessages(true);

    setInternalOrderNumber(makeOrderNumber("OS"));
    setInternalOrderId(ulid());

    createdDbRef.current = null;
    didNotifyRef.current = false;
    isCreatingRef.current = false;
  }, [totalPrice, dataFirstStep.deliveryMethod, basket]);

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
        disabled={!canPay || isSdkPending}
        createOrder={async () => {
          if (!canPay) {
            toast.error("PayPal createOrder blocked: invalid state");
            throw new Error("PayPal createOrder blocked: invalid state");
          }
          if (isCreatingRef.current)
            throw new Error("PayPal createOrder blocked: already creating");

          isCreatingRef.current = true;

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
            isCreatingRef.current = false;
            toast.error("Impossibile creare l’ordine. Riprova.");
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
            try {
              await deleteOrderByOrderId({ id: created.orderId });
            } catch (e) {
              console.error("Rollback deleteOrderByOrderId failed:", e);
            } finally {
              createdDbRef.current = null;
              isCreatingRef.current = false;
            }

            toast.error("Errore durante la creazione del pagamento. Riprova.");
            throw new Error(`Create PayPal order failed: ${String(pp.error ?? "")}`);
          }

          createdDbRef.current.providerOrderId = pp.orderId;

          try {
            await updateOrderPaymentAction({
              orderNumber: referenceId,
              data: { status: "CREATED", providerOrderId: pp.orderId },
            });
          } catch (e) {
            console.error("updateOrderPaymentAction after PayPal create failed:", e);
          } finally {
            isCreatingRef.current = false;
          }

          return pp.orderId;
        }}
        onApprove={async (data) => {
          const ppOrderId = data.orderID;
          const created = createdDbRef.current;

          if (!ppOrderId || !created?.orderNumber) {
            console.error("onApprove missing ppOrderId or internal order ref");
            return;
          }

          const referenceId = created.orderNumber;

          const cap = await capturePayPalOrderAction({
            orderId: ppOrderId,
            referenceId,
          });

          if (!cap.ok) {
            try {
              await updateOrderPaymentAction({
                orderNumber: referenceId,
                data: {
                  status: "FAILED",
                  providerOrderId: ppOrderId,
                  notes: String(cap.error ?? ""),
                },
              });
            } catch (e) {
              console.error("updateOrderPaymentAction FAILED after capture fail:", e);
            }
            toast.error("Pagamento non riuscito. Riprova o scegli un altro metodo.");
            return;
          }

          try {
            await updateOrderPaymentAction({
              orderNumber: referenceId,
              data: { status: "PAYED", providerOrderId: ppOrderId, notes: null },
            });
            await updateOrderInfoByOrderIDAction({
              orderId: created.orderId,
              dataToUpdate: { orderStatus: "PAID" },
            });
          } catch (e) {
            console.error("updateOrderPaymentAction SUCCESS after capture ok:", e);
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

          createdDbRef.current = null;
          isCreatingRef.current = false;

          router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${referenceId}`);
        }}
        onCancel={async () => {
          isCreatingRef.current = false;

          const created = createdDbRef.current;
          if (!created?.orderId) return;

          try {
            await deleteOrderByOrderId({ id: created.orderId });
            toast.info("Pagamento annullato.");
          } catch (e) {
            console.error("deleteOrderByOrderId onCancel failed:", e);
          } finally {
            createdDbRef.current = null;
            didNotifyRef.current = false;
          }
        }}
        onError={async (err) => {
          isCreatingRef.current = false;

          const created = createdDbRef.current;
          if (created?.orderId) {
            try {
              await deleteOrderByOrderId({ id: created.orderId });
            } catch (e) {
              console.error("deleteOrderByOrderId onError failed:", e);
            } finally {
              createdDbRef.current = null;
              didNotifyRef.current = false;
            }
          }

          console.error("PayPal error", err);
          toast.error("Errore durante la creazione del pagamento. Riprova tra poco.");
        }}
      />
    </div>
  );
}
