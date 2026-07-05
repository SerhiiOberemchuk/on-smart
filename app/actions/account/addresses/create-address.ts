"use server";

import { userAddressesSchema } from "@/db/schemas/user-addresses.schema";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireCustomerSession } from "../_shared/require-customer-session";
import type { AddressFormState } from "./address-action.types";

const MAX_ADDRESSES = 5;

function required(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}
function nullable(value: FormDataEntryValue | null): string | null {
  return required(value) || null;
}

export async function createAddress(
  _prev: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const session = await requireCustomerSession();
  const userId = session.user.id;

  const indirizzo = required(formData.get("indirizzo"));
  const numeroCivico = required(formData.get("numeroCivico"));
  const citta = required(formData.get("citta"));
  const cap = required(formData.get("cap"));
  const provinciaRegione = required(formData.get("provinciaRegione"));

  if (!indirizzo || !numeroCivico || !citta || !cap || !provinciaRegione) {
    return { success: false, message: "Compila tutti i campi obbligatori." };
  }

  const isDefaultShipping = formData.get("isDefaultShipping") === "on";
  const isDefaultBilling = formData.get("isDefaultBilling") === "on";

  try {
    const existing = await db
      .select({ id: userAddressesSchema.id })
      .from(userAddressesSchema)
      .where(eq(userAddressesSchema.userId, userId));

    if (existing.length >= MAX_ADDRESSES) {
      return { success: false, message: `Puoi salvare al massimo ${MAX_ADDRESSES} indirizzi.` };
    }

    await db.transaction(async (tx) => {
      if (isDefaultShipping) {
        await tx
          .update(userAddressesSchema)
          .set({ isDefaultShipping: false })
          .where(eq(userAddressesSchema.userId, userId));
      }
      if (isDefaultBilling) {
        await tx
          .update(userAddressesSchema)
          .set({ isDefaultBilling: false })
          .where(eq(userAddressesSchema.userId, userId));
      }
      await tx.insert(userAddressesSchema).values({
        userId,
        label: nullable(formData.get("label")),
        nome: nullable(formData.get("nome")),
        cognome: nullable(formData.get("cognome")),
        numeroTelefono: nullable(formData.get("numeroTelefono")),
        indirizzo,
        numeroCivico,
        citta,
        cap,
        provinciaRegione,
        nazione: nullable(formData.get("nazione")) ?? "IT",
        isDefaultShipping,
        isDefaultBilling,
      });
    });

    revalidatePath("/account/indirizzi");
  } catch (error) {
    console.error("[createAddress]", error);
    return { success: false, message: "Impossibile salvare l'indirizzo. Riprova." };
  }

  return { success: true, message: "Indirizzo salvato." };
}
