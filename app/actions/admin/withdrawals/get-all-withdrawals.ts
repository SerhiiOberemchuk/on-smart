"use server";

import { db } from "@/db/db";
import {
  withdrawalRequestsSchema,
  type WithdrawalRequestType,
} from "@/db/schemas/withdrawal-requests.schema";
import { desc } from "drizzle-orm";
import { requireAdminSession } from "../_shared/require-admin-session";

export type GetAllWithdrawalsResponse = {
  withdrawals: WithdrawalRequestType[];
  error: unknown | null;
};

export async function getAllWithdrawalRequests(): Promise<GetAllWithdrawalsResponse> {
  await requireAdminSession();

  try {
    const withdrawals = await db
      .select()
      .from(withdrawalRequestsSchema)
      .orderBy(desc(withdrawalRequestsSchema.createdAt));

    return { withdrawals, error: null };
  } catch (error) {
    console.error("[getAllWithdrawalRequests]", error);
    return { withdrawals: [], error };
  }
}
