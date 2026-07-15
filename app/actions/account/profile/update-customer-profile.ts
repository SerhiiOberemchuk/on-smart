"use server";

import { customerProfilesSchema } from "@/db/schemas/customer-profile.schema";
import { db } from "@/db/db";
import { CLIENT_TYPE_LIST, DELIVERY_METHOD_LIST } from "@/types/orders.types";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { PAYMENT_PROVIDER_LIST } from "@/types/payments.types";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { requireCustomerSession } from "../_shared/require-customer-session";
import type { ProfileFormState } from "./profile-action.types";

function nullable(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text || null;
}

function pickEnum<T extends readonly string[]>(list: T, raw: string, fallback: T[number]): T[number] {
  return (list as readonly string[]).includes(raw) ? (raw as T[number]) : fallback;
}

export async function updateCustomerProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireCustomerSession();
  const userId = session.user.id;

  const paymentRaw = String(formData.get("defaultPaymentMethod") ?? "");
  const values = {
    numeroTelefono: nullable(formData.get("numeroTelefono")),
    clientType: pickEnum(CLIENT_TYPE_LIST, String(formData.get("clientType") ?? ""), "privato"),
    nome: nullable(formData.get("nome")),
    cognome: nullable(formData.get("cognome")),
    codiceFiscale: nullable(formData.get("codiceFiscale")),
    referenteContatto: nullable(formData.get("referenteContatto")),
    ragioneSociale: nullable(formData.get("ragioneSociale")),
    partitaIva: nullable(formData.get("partitaIva")),
    pecAzzienda: nullable(formData.get("pecAzzienda")),
    codiceUnico: nullable(formData.get("codiceUnico")),
    defaultDeliveryMethod: pickEnum(
      DELIVERY_METHOD_LIST,
      String(formData.get("defaultDeliveryMethod") ?? ""),
      "CONSEGNA_CORRIERE",
    ),
    defaultPaymentMethod: (PAYMENT_PROVIDER_LIST as readonly string[]).includes(paymentRaw)
      ? (paymentRaw as (typeof PAYMENT_PROVIDER_LIST)[number])
      : null,
    requestInvoiceDefault: formData.get("requestInvoiceDefault") === "on",
  };

  try {
    const [existing] = await db
      .select({ id: customerProfilesSchema.id })
      .from(customerProfilesSchema)
      .where(eq(customerProfilesSchema.userId, userId))
      .limit(1);

    if (existing) {
      await db.update(customerProfilesSchema).set(values).where(eq(customerProfilesSchema.userId, userId));
    } else {
      await db.insert(customerProfilesSchema).values({ userId, ...values });
    }
  } catch (error) {
    console.error("[updateCustomerProfile]", error);
    return { success: false, message: "Impossibile salvare i dati. Riprova." };
  }

  // Invalidate the per-user profile cache so every server component that reads
  // it (profile page, checkout, cart) re-renders with the new defaults — no
  // hard reload needed.
  updateTag(CACHE_TAGS.customerProfile.byUser(userId));

  return { success: true, message: "Dati salvati." };
}
