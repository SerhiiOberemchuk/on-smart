"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { notifyOrderById } from "@/app/actions/notify-order-by-id/notify-order-by-id";
import { getSumUpCheckoutStatus } from "@/app/actions/sumup/action";
import { SUM_UP_CONSTANTS } from "@/app/actions/sumup/sumup-constans";
import { PAGES } from "@/types/pages.types";

export default function SumUpPageClient({
  searchParams,
  order,
}: {
  order: Promise<{ order: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParamsState = use(searchParams);
  const { order: orderNumber } = use(order);
  const router = useRouter();
  const [statePaymentStatus, setStatePaymentStatus] = useState<
    SumUpCardResponseBody["status"] | null | string
  >(null);

  useEffect(() => {
    (async () => {
      const checkoutParam = searchParamsState?.[SUM_UP_CONSTANTS.SEARCH_PARAM_CHECKOUT_ID.TITLE];
      if (typeof checkoutParam !== "string") return;

      const resp = await getSumUpCheckoutStatus(checkoutParam);
      setStatePaymentStatus(resp.status);
    })();
  }, [searchParamsState]);

  useEffect(() => {
    if (statePaymentStatus === "PAID") {
      (async () => {
        try {
          await updateOrderPaymentAction({
            orderNumber,
            data: { status: "PAYED" },
          });
        } catch (error) {
          console.error("Error updating order payment:", error);
        }

        const orderIdParam = searchParamsState?.order_id;
        if (typeof orderIdParam === "string" && orderIdParam.trim().length > 0) {
          try {
            await notifyOrderById({ orderId: orderIdParam });
          } catch (error) {
            console.error("Error sending notifications:", error);
          }
        }

        router.push(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${orderNumber}`);
      })();
      return;
    }

    if (statePaymentStatus === "FAILED" || statePaymentStatus === "EXPIRED") {
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

      toast.error(
        "Il pagamento è fallito o è stato annullato. Se pensi che sia un errore, contatta il supporto. Verrai reindirizzato alla pagina di pagamento per riprovare.",
      );

      router.push(
        `${PAGES.CHECKOUT_PAGES.PAYMENT}?order=${orderNumber}&sumup_status=${statePaymentStatus}`,
      );
    }
  }, [statePaymentStatus, searchParamsState, orderNumber, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <h1 className="animate-pulse">Verifica pagamento tramite tecnologia SumUp in corso...</h1>
    </div>
  );
}
