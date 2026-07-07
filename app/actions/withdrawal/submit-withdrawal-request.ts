"use server";

import { db } from "@/db/db";
import { ordersSchema } from "@/db/schemas/orders.schema";
import { withdrawalRequestsSchema } from "@/db/schemas/withdrawal-requests.schema";
import { auth } from "@/lib/auth";
import { sendWithdrawalReceiptMail } from "@/lib/withdrawal-mail";
import type { WithdrawalFormState } from "@/types/withdrawal.types";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { sendTelegramWithdrawalMessage } from "../telegram/send-withdrawal-message";

function required(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

// Art. 54-bis Codice del Consumo: the online withdrawal statement must let the
// consumer provide name, contract identification and the electronic means for
// the receipt confirmation. Works for guests too (historic guest orders), so
// the session is optional and responses never reveal whether an order exists.
export async function submitWithdrawalRequest(
  _prev: WithdrawalFormState,
  formData: FormData,
): Promise<WithdrawalFormState> {
  const nome = required(formData.get("nome"));
  const email = required(formData.get("email")).toLowerCase();
  const orderNumber = required(formData.get("orderNumber")).toUpperCase();
  const message = required(formData.get("message")) || null;

  if (!nome || !email || !orderNumber) {
    return { success: false, message: "Compila nome, email e numero d'ordine." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Inserisci un indirizzo email valido." };
  }

  try {
    const [existing] = await db
      .select({ id: withdrawalRequestsSchema.id })
      .from(withdrawalRequestsSchema)
      .where(
        and(
          eq(withdrawalRequestsSchema.orderNumber, orderNumber),
          eq(withdrawalRequestsSchema.email, email),
          inArray(withdrawalRequestsSchema.status, ["RECEIVED", "PROCESSING"]),
        ),
      )
      .limit(1);

    if (existing) {
      return {
        success: false,
        message:
          "Abbiamo già ricevuto una tua dichiarazione di recesso per questo ordine: è in lavorazione. Per informazioni scrivi ad assistenza@on-smart.it.",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const sessionUserId = session?.user?.id ?? null;

    // Link the order only when the requester plausibly owns it (email on the
    // order or the logged-in owner). An unmatched request is still recorded —
    // the statement is legally submitted either way; admin triages it.
    const [order] = await db
      .select({ id: ordersSchema.id, email: ordersSchema.email, userId: ordersSchema.userId })
      .from(ordersSchema)
      .where(eq(ordersSchema.orderNumber, orderNumber))
      .limit(1);

    const ownsOrder =
      Boolean(order) &&
      (order.email.toLowerCase() === email || (sessionUserId !== null && order.userId === sessionUserId));

    const submittedAt = new Date();

    await db.insert(withdrawalRequestsSchema).values({
      orderId: ownsOrder ? order.id : null,
      orderNumber,
      userId: sessionUserId,
      nome,
      email,
      message,
      createdAt: submittedAt,
    });

    // Receipt on a durable medium with content + date/time (comma 6). The
    // statement is already registered, so a mail failure must not undo it —
    // the Telegram alert flags it for manual follow-up.
    let mailSent = true;
    try {
      await sendWithdrawalReceiptMail({ to: email, nome, orderNumber, message, submittedAt });
    } catch (mailError) {
      console.error("[submitWithdrawalRequest] receipt mail failed:", mailError);
      mailSent = false;
    }

    try {
      await sendTelegramWithdrawalMessage({
        orderNumber,
        orderId: ownsOrder ? order.id : null,
        nome,
        email,
        note: message,
        mailSent,
      });
    } catch (telegramError) {
      console.error("[submitWithdrawalRequest] telegram failed:", telegramError);
    }

    return {
      success: true,
      message:
        "La tua dichiarazione di recesso è stata inviata. Riceverai a breve una email di conferma con data e ora di trasmissione.",
      submittedAt: submittedAt.toISOString(),
    };
  } catch (error) {
    console.error("[submitWithdrawalRequest]", error);
    return { success: false, message: "Impossibile inviare la richiesta. Riprova più tardi." };
  }
}
