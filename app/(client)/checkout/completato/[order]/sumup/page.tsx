import { redirect } from "next/navigation";
import { getSumUpCheckoutStatus } from "@/app/actions/sumup/action";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { updateOrderInfoByOrderIDAction } from "@/app/actions/orders/udate-order-info";
import { SUM_UP_CONSTANTS } from "@/app/actions/sumup/sumup-constans";
import { PAGES } from "@/types/pages.types";
import { getOrderFullInfoById } from "@/app/actions/orders/get-order";
import { notifyOrderById } from "@/app/actions/notify-order-by-id/notify-order-by-id";

export default async function SumUpCallbackPage({
  params,
  searchParams,
}: PageProps<"/checkout/completato/[order]/sumup">) {
  const { order: orderNumber } = await params;
  const searchParamsState = await searchParams;
  const summaryWithError = (reason: string) =>
    `${PAGES.CHECKOUT_PAGES.SUMMARY}?payment_error=${encodeURIComponent(reason)}`;

  const checkoutId = searchParamsState[SUM_UP_CONSTANTS.SEARCH_PARAM_CHECKOUT_ID.TITLE];
  const order_id = searchParamsState["order_id"];

  if (!checkoutId || !order_id) {
    redirect(summaryWithError("sumup_missing_checkout_id"));
  }

  const info = await getOrderFullInfoById({ id: order_id as string });
  const order = info?.order;

  if (!order) {
    redirect(summaryWithError("sumup_order_not_found"));
  }
  try {
    const resp = await getSumUpCheckoutStatus(checkoutId as string);
    const status = resp.status;

    if (status === "PAID") {
      await updateOrderPaymentAction({
        orderNumber,
        data: {
          status: "PAYED",
          providerOrderId: checkoutId as string,
          notes: `SumUp status: ${status}`,
        },
      });

      await updateOrderInfoByOrderIDAction({
        orderId: order.id,
        dataToUpdate: { orderStatus: "PAID" },
      });

      if (true) {
        try {
          await notifyOrderById({ orderId: order.id });
          console.log(" Messaggio notificato con successo");
        } catch (e) {
          console.error("Notify error:", e);
        }
      }

      redirect(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${orderNumber}?sumup=paid`);
    }

    if (status === "FAILED" || status === "EXPIRED") {
      await updateOrderPaymentAction({
        orderNumber,
        data: {
          status: "FAILED",
          providerOrderId: checkoutId as string,
          notes: `SumUp status: ${status}`,
        },
      });

      redirect(summaryWithError(`sumup_${status.toLowerCase()}`));
    }

    await updateOrderPaymentAction({
      orderNumber,
      data: {
        status: "PENDING",
        providerOrderId: checkoutId as string,
        notes: `SumUp status: ${status}`,
      },
    });

    redirect(summaryWithError("sumup_pending_verification"));
  } catch (error) {
    console.error("SumUp callback error:", error);
    await updateOrderPaymentAction({
      orderNumber,
      data: {
        status: "FAILED",
        providerOrderId: (checkoutId as string) ?? null,
        notes: error instanceof Error ? error.message : "SumUp callback runtime error",
      },
    });
    redirect(summaryWithError("sumup_runtime_error"));
  }
}
