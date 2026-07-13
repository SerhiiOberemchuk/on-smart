import { redirect } from "next/navigation";
import { getSumUpCheckoutStatus } from "@/app/actions/sumup/action";
import { updateOrderPaymentAction } from "@/app/actions/payments/payment-order-actions";
import { persistPaidOrder } from "@/app/actions/orders/_internal/persist-paid-order";
import { SUM_UP_CONSTANTS } from "@/app/actions/sumup/sumup-constans";
import { PAGES } from "@/types/pages.types";
import { getOrderFullInfoById } from "@/app/actions/orders/get-order";
import { notifyOrderById } from "@/app/actions/notify-order-by-id/notify-order-by-id";
import { connection } from "next/server";
import { Suspense } from "react";

export default function SumUpCallbackPage(props: PageProps<"/checkout/completato/[order]/sumup">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SumUpCallbackContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function SumUpCallbackContent({
  params,
  searchParams,
}: PageProps<"/checkout/completato/[order]/sumup">) {
  await connection();
  const { order: orderNumber } = await params;
  const searchParamsState = await searchParams;
  const summaryWithError = (reason: string) =>
    `/checkout?payment_error=${encodeURIComponent(reason)}`;

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

  // Non-success payment transitions only (FAILED / PENDING). The PAID state is
  // persisted via persistPaidOrder below, after SumUp's status is verified.
  async function persistPaymentState({
    paymentData,
  }: {
    paymentData: Partial<{
      status: "CREATED" | "PENDING" | "FAILED" | "CANCELED";
      providerOrderId: string | null;
      notes: string | null;
    }>;
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

    return { success: true as const };
  }

  try {
    const resp = await getSumUpCheckoutStatus(checkoutId as string);
    const status = resp.status;

    if (status === "PAID") {
      // Payment verified server-side with SumUp — persist PAYED + PAID in the
      // trusted server-only helper (never via the client-reachable action).
      const persisted = await persistPaidOrder({
        orderId: currentOrder.id,
        orderNumber,
        providerOrderId: checkoutId as string,
        notes: `SumUp status: ${status}`,
      });

      if (!persisted) {
        redirect(summaryWithError("sumup_paid_persist_failed"));
      }

      try {
        await notifyOrderById({ orderId: currentOrder.id });
      } catch (e) {
        console.error("Notify error:", e);
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

  return null;
}
