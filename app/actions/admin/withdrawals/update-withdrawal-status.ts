"use server";

import { db } from "@/db/db";
import { withdrawalRequestsSchema } from "@/db/schemas/withdrawal-requests.schema";
import { WITHDRAWAL_STATUS_LIST, type WithdrawalStatusType } from "@/types/withdrawal.types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "../_shared/require-admin-session";

export async function updateWithdrawalStatus({
  id,
  status,
}: {
  id: string;
  status: WithdrawalStatusType;
}): Promise<{ success: boolean; errorMessage?: string }> {
  await requireAdminSession();

  if (!id || !WITHDRAWAL_STATUS_LIST.includes(status)) {
    return { success: false, errorMessage: "Невірні дані запиту" };
  }

  try {
    await db
      .update(withdrawalRequestsSchema)
      .set({ status })
      .where(eq(withdrawalRequestsSchema.id, id));

    revalidatePath("/admin/dashboard/returns");
    return { success: true };
  } catch (error) {
    console.error("[updateWithdrawalStatus]", error);
    return { success: false, errorMessage: "Помилка збереження статусу" };
  }
}
