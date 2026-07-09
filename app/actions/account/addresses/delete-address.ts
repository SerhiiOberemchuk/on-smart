"use server";

import { userAddressesSchema } from "@/db/schemas/user-addresses.schema";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireCustomerSession } from "../_shared/require-customer-session";

export async function deleteAddress(formData: FormData): Promise<void> {
  const session = await requireCustomerSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await db
      .delete(userAddressesSchema)
      .where(and(eq(userAddressesSchema.id, id), eq(userAddressesSchema.userId, session.user.id)));
    revalidatePath("/account/indirizzi");
  } catch (error) {
    console.error("[deleteAddress]", error);
  }
}
