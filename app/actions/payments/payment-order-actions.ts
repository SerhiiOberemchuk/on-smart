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
}) {
  try {
    await db.update(paymentsSchema).set(data).where(eq(paymentsSchema.orderNumber, orderNumber));
    return {
      success: true,
    };
  } catch (error) {
    return { error };
  }
}

export type GetAllOrdersPaymentActionResponseTypes = Promise<{
  error: null | unknown;
  payments: OrderPaymentTypes[] | null;
}>;

async function getAllOrdersPaymentCachedCore(): Promise<OrderPaymentTypes[]> {
  "use cache";
  cacheLife("seconds");

  return withRetrySelective(() => db.select().from(paymentsSchema), PAYMENTS_READ_RETRY_OPTIONS);
}

export async function getAllOrdersPaymentAction(): GetAllOrdersPaymentActionResponseTypes {
  try {
    const payments = await getAllOrdersPaymentCachedCore();
    return { payments, error: null };
  } catch (error) {
    return { error, payments: null };
  }
}
