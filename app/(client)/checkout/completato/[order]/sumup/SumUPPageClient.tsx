"use client";

import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { sendMailOrders } from "@/app/actions/mail/mail-orders";
import { sendTelegramMessage } from "@/app/actions/telegram/send-message";
import { getSumUpCheckoutStatus } from "@/app/actions/sumup/action";
import { use, useEffect, useState } from "react";
import { SUM_UP_CONSTANTS } from "@/app/actions/sumup/sumup-constans";
import { useRouter } from "next/navigation";
import { PAGES } from "@/types/pages.types";
import { toast } from "react-toastify";
import { useCheckoutStore } from "@/store/checkout-store";
import { useBasketStore } from "@/store/basket-store";

export default function SumUpPageClient({
  searchParams,
  order,
}: {
  order: Promise<{
    order: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParamsState = use(searchParams);
  const { order: orderNumber } = use(order);
  const router = useRouter();
  const [statePaymentStatus, setStatePaymentStatus] = useState<
    SumUpCardResponseBody["status"] | null | string
  >(null);

  const { dataCheckoutStepPagamento, dataCheckoutStepConsegna, dataFirstStep, basket, totalPrice } =
    useCheckoutStore();
  const { productsInBasket } = useBasketStore();

  useEffect(() => {
    (async () => {
      if (searchParamsState?.[SUM_UP_CONSTANTS.SEARCH_PARAM_CHECKOUT_ID.TITLE]) {
        const checkoutId = searchParamsState[
          SUM_UP_CONSTANTS.SEARCH_PARAM_CHECKOUT_ID.TITLE
        ] as string;
        const resp = await getSumUpCheckoutStatus(checkoutId);
        setStatePaymentStatus(resp.status);
        console.log("SumUp status: ", resp);
      }
    })();
  }, [searchParamsState]);

  useEffect(() => {
    if (statePaymentStatus === "PAID") {
      (async () => {
        try {
          await sendMailOrders({
            orderNumber,
            customerData: dataFirstStep,
            dataCheckoutStepConsegna,
            dataCheckoutStepPagamento,
            bascket: basket,
            productsInBasket,
          });
          console.log("log after send email");
        } catch (error) {
          console.error("Error sending email:", error);
        }

        try {
          await sendTelegramMessage({
            orderNumber,
            total: totalPrice.toFixed(2),
            email: dataFirstStep.email,
            paymentMethod: "SumUp",
            customerDisplayName: dataFirstStep.nome + " " + dataFirstStep.cognome,
            deliveryMethod: dataFirstStep.deliveryMethod,
            orderId: searchParamsState?.order_id as string,
            numeroTelefono: dataFirstStep.numeroTelefono,
            deliveryPrice: dataFirstStep.deliveryPrice.toFixed(2),
          });

          console.log("log after send telegram message");
        } catch (error) {
          console.error("Error sending telegram message:", error);
        }
        try {
          await updateOrderPaymentAction({
            orderNumber,
            data: {
              status: "PAYED",
            },
          });
          console.log("log after update payment");
        } catch (error) {
          console.error("Error updating order:", error);
        }
        router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${orderNumber}`);
      })();
    } else if (statePaymentStatus === "FAILED" || statePaymentStatus === "EXPIRED") {
      (async () => {
        try {
          await updateOrderPaymentAction({
            orderNumber,
            data: {
              status: "FAILED",
              notes: statePaymentStatus,
            },
          });
        } catch (error) {
          console.error("Error updating order:", error);
        }
      })();
      console.log("log else block ");

      toast.error(
        "Il pagamento è fallito o è stato annullato. Se pensi che sia un errore, contatta il supporto. Verrai reindirizzato alla pagina di pagamento per riprovare.",
      );

      router.push(
        `${PAGES.CHECKOUT_PAGES.PAYMENT}?order=${orderNumber}&sumup_status=${statePaymentStatus}`,
      );
    }
  }, [
    statePaymentStatus,
    searchParamsState,
    basket,
    dataCheckoutStepConsegna,
    dataCheckoutStepPagamento,
    dataFirstStep,
    orderNumber,
    productsInBasket,
    router,
    totalPrice,
  ]);
  return (
    <div className="flex items-center justify-center py-20">
      {" "}
      <h1 className="animate-pulse">Verifica pagamento tramite tecnologia SumUp in corso...</h1>
    </div>
  );
}
