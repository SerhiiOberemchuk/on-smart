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

  const currentOrder = order;

  async function persistPaymentState({
    paymentData,
    orderStatus,
  }: {
    paymentData: Partial<{
      status: "CREATED" | "PENDING" | "PAYED" | "FAILED" | "CANCELED";
      providerOrderId: string | null;
      notes: string | null;
    }>;
    orderStatus?: "PAID";
  }) {
    const paymentUpdate = await updateOrderPaymentAction({
      orderNumber,
      data: paymentData,
    });

    if (!paymentUpdate.success) {
      console.error("[SumUpCallbackPage] payment update failed", {
        orderNumber,
        checkoutId,
        errorCode: paymentUpdate.errorCode,
        errorMessage: paymentUpdate.errorMessage,
      });

      return {
        success: false as const,
        stage: "payment_update" as const,
      };
    }

    if (!orderStatus) {
      return { success: true as const };
    }

    const orderUpdate = await updateOrderInfoByOrderIDAction({
      orderId: currentOrder.id,
      dataToUpdate: { orderStatus },
    });

    if (!orderUpdate.success) {
      console.error("[SumUpCallbackPage] order update failed", {
        orderId: currentOrder.id,
        orderNumber,
        checkoutId,
        errorCode: orderUpdate.errorCode,
        errorMessage: orderUpdate.errorMessage,
      });

      return {
        success: false as const,
        stage: "order_update" as const,
      };
    }

    return { success: true as const };
  }

  try {
    const resp = await getSumUpCheckoutStatus(checkoutId as string);
    const status = resp.status;

    if (status === "PAID") {
      const persistResult = await persistPaymentState({
        paymentData: {
          status: "PAYED",
          providerOrderId: checkoutId as string,
          notes: `SumUp status: ${status}`,
        },
        orderStatus: "PAID",
      });

      if (!persistResult.success) {
        redirect(summaryWithError("sumup_paid_persist_failed"));
      }

      if (true) {
        try {
          await notifyOrderById({ orderId: currentOrder.id });
          console.log(" Messaggio notificato con successo");
        } catch (e) {
          console.error("Notify error:", e);
        }
      }

      redirect(`${PAGES.CHECKOUT_PAGES.COMPLETED}/${orderNumber}?sumup=paid`);
    }

    if (status === "FAILED" || status === "EXPIRED") {
      await persistPaymentState({
        paymentData: {
          status: "FAILED",
          providerOrderId: checkoutId as string,
          notes: `SumUp status: ${status}`,
        },
      });

      redirect(summaryWithError(`sumup_${status.toLowerCase()}`));
    }

    await persistPaymentState({
      paymentData: {
        status: "PENDING",
        providerOrderId: checkoutId as string,
        notes: `SumUp status: ${status}`,
      },
    });

    redirect(summaryWithError("sumup_pending_verification"));
  } catch (error) {
    console.error("SumUp callback error:", error);
    await persistPaymentState({
      paymentData: {
        status: "FAILED",
        providerOrderId: (checkoutId as string) ?? null,
        notes: error instanceof Error ? error.message : "SumUp callback runtime error",
      },
    });
    redirect(summaryWithError("sumup_runtime_error"));
  }
}
