"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";

import KlarnaScript from "./KlarnaScript";
import ButtonYellow from "@/components/BattonYellow";

import {
  createKlarnaSessionAction,
  KlarnaSessionResponseType,
} from "@/app/actions/klarna/create-session";
import { placeKlarnaOrder } from "@/app/actions/klarna/create-order";

import { createOrderAction } from "@/app/actions/orders/create-order";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { deleteOrderByOrderId } from "@/app/actions/orders/delete-order";

import { sendMailOrders } from "@/app/actions/mail/mail-orders";
import { sendTelegramMessage } from "@/app/actions/telegram/send-message";

import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";

import { PAGES } from "@/types/pages.types";
import { getTotalPriceToPay } from "@/utils/get-prices";
import { makeOrderNumber } from "@/utils/order-number";
import { ulid } from "ulid";

import { KlarnaAuthorizeResponse, KlarnaPaymentsLoadResponse } from "@/types/klarna";
import { updateOrderInfoByOrderIDAction } from "@/app/actions/orders/udate-order-info";

const containerId = "klarna_container";
const currency = "EUR";

type CreatedOrderRef = {
  orderId: string;
  orderNumber: string;
};

export default function KlarnaPaymentWidget() {
  const router = useRouter();

  const { dataFirstStep, dataCheckoutStepConsegna, totalPrice, dataCheckoutStepPagamento } =
    useCheckoutStore();
  const { productsInBasket, basket } = useBasketStore();

  const [sessionData, setSessionData] = useState<KlarnaSessionResponseType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [orderNumber] = useState(() => makeOrderNumber("OS"));
  const [orderId] = useState(() => ulid());

  const createdRef = useRef<CreatedOrderRef | null>(null);
  const isCreatingRef = useRef(false);
  const didNotifyRef = useRef(false);

  const priceToPay = useMemo<number>(() => {
    if (!totalPrice) return 0;
    return Number(
      getTotalPriceToPay({
        totalPrice,
        deliveryMetod: dataFirstStep.deliveryMethod,
      }).toFixed(2),
    );
  }, [totalPrice, dataFirstStep.deliveryMethod]);

  const selectedCategory = useMemo<string | null>(
    () => sessionData?.payment_method_categories?.[0]?.identifier ?? null,
    [sessionData],
  );

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
          totalPrice: priceToPay,
          basket,
        });

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
    priceToPay,
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
      toast.error("Errore creazione ordine");
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
            await deleteOrderByOrderId({ id: created.orderId });
            toast.info("Pagamento annullato");
            return;
          }

          await placeKlarnaOrder({
            authorizationToken: res.authorization_token,
            orderNumber,
            dataFirstStep,
            dataCheckoutStepConsegna,
            productsInBasket,
            totalPrice: priceToPay,
            basket,
          });

          await updateOrderPaymentAction({
            orderNumber,
            data: {
              status: "SUCCESS",
              providerOrderId: res.authorization_token,
            },
          });
          await updateOrderInfoByOrderIDAction({
            orderId: created.orderId,
            dataToUpdate: { orderStatus: "PAID" },
          });
          if (!didNotifyRef.current) {
            didNotifyRef.current = true;

            await sendMailOrders({
              orderNumber,
              customerData: dataFirstStep,
              dataCheckoutStepConsegna,
              dataCheckoutStepPagamento: { paymentMethod: "klarna", title: "Klarna" },
              productsInBasket,
              bascket: basket,
            });

            await sendTelegramMessage({
              orderNumber,
              orderId,
              customerDisplayName:
                `${dataFirstStep.nome ?? ""} ${dataFirstStep.cognome ?? ""}`.trim() || "Cliente",
              total: String(priceToPay),
              paymentMethod: "Klarna",
              deliveryMethod: dataFirstStep.deliveryMethod,
              email: dataFirstStep.email,
              numeroTelefono: dataFirstStep.numeroTelefono,
            });
          }

          router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${orderNumber}`);
        } catch (e) {
          console.error(e);
          await deleteOrderByOrderId({ id: created.orderId });
          toast.error("Errore pagamento Klarna");
        } finally {
          isCreatingRef.current = false;
          setIsPaying(false);
        }
      },
    );
  };

  return (
    <div className="space-y-4 py-5">
      <KlarnaScript />

      <h2 className="text-xl font-semibold">Pagamento con Klarna</h2>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div id={containerId} className="min-h-[180px] rounded-md border bg-amber-50 p-3" />

      <ButtonYellow
        className={twMerge(
          "ml-auto",
          (!canPay || isPaying || loadingSession) && "cursor-not-allowed opacity-60",
        )}
        disabled={!canPay || isPaying || loadingSession}
        onClick={handleAuthorize}
      >
        {isPaying ? "Pagamento in corso..." : "Conferma e paga con Klarna"}
      </ButtonYellow>
    </div>
  );
}
