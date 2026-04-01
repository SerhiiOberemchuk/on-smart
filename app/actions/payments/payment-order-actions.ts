"use server";

import { db } from "@/db/db";
import { OrderPaymentTypes, paymentsSchema } from "@/db/schemas/orders.schema";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { eq } from "drizzle-orm";
import { cacheLife } from "next/cache";

const PAYMENTS_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;

export type GetOrderPayInfoResponseType = Promise<{
  success: boolean;
  paymentInfo: OrderPaymentTypes | null;
  error?: undefined | unknown;
}>;

export type PaymentMutationResult =
  | {
      success: true;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      errorCode: "INVALID_INPUT" | "DB_ERROR";
      errorMessage: string;
    };

export async function getOrderPaymentByOrderNumberAction({
  orderNumber,
}: {
  orderNumber: string;
}): GetOrderPayInfoResponseType {
  try {
    const payment = await db
      .select()
      .from(paymentsSchema)
      .where(eq(paymentsSchema.orderNumber, orderNumber));

    return {
      success: true,
      paymentInfo: payment[0],
    };
  } catch (error) {
    return { error, success: false, paymentInfo: null };
  }
}

export async function updateOrderPaymentAction({
  orderNumber,
  data,
}: {
  orderNumber: OrderPaymentTypes["orderId"];
  data: Partial<Omit<OrderPaymentTypes, "id" | "createdAt" | "updatedAt">>;
}): Promise<PaymentMutationResult> {
  if (!orderNumber) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Order number is required",
    };
  }

  try {
    await db.update(paymentsSchema).set(data).where(eq(paymentsSchema.orderNumber, orderNumber));
    return {
      success: true,
      errorCode: null,
      errorMessage: null,
    };
  } catch (error) {
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: error instanceof Error ? error.message : "Failed to update order payment",
    };
  }
}

export type GetAllOrdersPaymentActionResponseTypes = Promise<{
  error: null | unknown;
  payments: OrderPaymentTypes[] | null;
}>;

export async function getAllOrdersPaymentAction(): GetAllOrdersPaymentActionResponseTypes {
  "use cache";
  cacheLife("seconds");

  try {
    const payments = await withRetrySelective(
      () => db.select().from(paymentsSchema),
      PAYMENTS_READ_RETRY_OPTIONS,
    );
    return { payments, error: null };
  } catch (error) {
    return { error, payments: null };
  }
}
