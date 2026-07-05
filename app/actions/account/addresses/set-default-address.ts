"use server";

import { userAddressesSchema } from "@/db/schemas/user-addresses.schema";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireCustomerSession } from "../_shared/require-customer-session";

export async function setDefaultAddress(formData: FormData): Promise<void> {
  const session = await requireCustomerSession();
  const userId = session.user.id;
  const id = String(formData.get("id") ?? "");
  const kind = String(formData.get("kind") ?? "");

  if (!id || (kind !== "shipping" && kind !== "billing")) return;

  const clearValue =
    kind === "shipping" ? { isDefaultShipping: false } : { isDefaultBilling: false };
  const setValue = kind === "shipping" ? { isDefaultShipping: true } : { isDefaultBilling: true };

  try {
    await db.transaction(async (tx) => {
      await tx.update(userAddressesSchema).set(clearValue).where(eq(userAddressesSchema.userId, userId));
      await tx
        .update(userAddressesSchema)
        .set(setValue)
        .where(and(eq(userAddressesSchema.id, id), eq(userAddressesSchema.userId, userId)));
    });
    revalidatePath("/account/indirizzi");
  } catch (error) {
    console.error("[setDefaultAddress]", error);
  }
}
