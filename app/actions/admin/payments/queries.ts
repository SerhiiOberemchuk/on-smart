"use server";

import {
  getAllOrdersPaymentAction as getAllOrdersPaymentActionBase,
  type GetAllOrdersPaymentActionResponseTypes,
} from "@/app/actions/payments/payment-order-actions";

import { requireAdminSession } from "../_shared/require-admin-session";

export async function getAllOrdersPaymentAction(): GetAllOrdersPaymentActionResponseTypes {
  await requireAdminSession();
  return getAllOrdersPaymentActionBase();
}
