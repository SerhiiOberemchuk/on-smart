import { emailShell } from "@/lib/auth-mail";
import { transporterOrders } from "@/lib/mail-transporter";

// Art. 54-bis Codice del Consumo: the trader must acknowledge receipt of the
// online withdrawal statement without undue delay, on a durable medium,
// including its content and the date and time of submission.
//
// Sent via transporterOrders (the same proven-deliverable mailbox as the order
// confirmations); the owner copy lands in MAIL_USER_ORDERS, which the shop
// already monitors — mirrors app/actions/mail/mail-orders.ts.

export function formatWithdrawalTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Europe/Rome",
  }).format(date);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function detailsTable(params: {
  orderNumber: string;
  nome: string;
  email: string;
  timestamp: string;
  message: string | null;
}): string {
  return `
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">Ordine:</td><td style="padding: 4px 0;"><strong>${escapeHtml(params.orderNumber)}</strong></td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">Nome:</td><td style="padding: 4px 0;">${escapeHtml(params.nome)}</td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email:</td><td style="padding: 4px 0;">${escapeHtml(params.email)}</td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">Data e ora di invio:</td><td style="padding: 4px 0;"><strong>${params.timestamp}</strong></td></tr>
      ${params.message ? `<tr><td style="padding: 4px 12px 4px 0; color: #666; vertical-align: top;">Note:</td><td style="padding: 4px 0;">${escapeHtml(params.message)}</td></tr>` : ""}
    </table>
  `;
}

/**
 * Sends the customer receipt (legal art. 54-bis acknowledgment) and an owner
 * copy. Each send is independent: one failure does not block the other. Returns
 * which of the two went out so the caller can flag a missing customer receipt.
 */
export async function sendWithdrawalMails(params: {
  to: string;
  nome: string;
  orderNumber: string;
  message: string | null;
  submittedAt: Date;
}): Promise<{ customerSent: boolean; ownerSent: boolean }> {
  const timestamp = formatWithdrawalTimestamp(params.submittedAt);
  const nome = params.nome.trim() || "Cliente";
  const table = detailsTable({ ...params, nome, email: params.to, timestamp });

  const customerBody = `
    <p>Gentile ${escapeHtml(nome)},</p>
    <p>confermiamo di aver ricevuto la tua <strong>dichiarazione di recesso</strong> inviata tramite il nostro sito (art. 54-bis Codice del Consumo).</p>
    ${table}
    <p>La tua richiesta verrà gestita al più presto: riceverai le istruzioni per la restituzione del prodotto e per il rimborso a questo indirizzo email.</p>
    <p style="color: #666;">Per qualsiasi domanda scrivi a <a href="mailto:${process.env.MAIL_USER_ASSISTENZA}" style="color: #666;">${process.env.MAIL_USER_ASSISTENZA}</a>.</p>
  `;

  const ownerBody = `
    <p>È stata ricevuta una nuova <strong>dichiarazione di recesso</strong> dal sito.</p>
    ${table}
    <p style="color: #666;">Gestiscila nel pannello admin, sezione «Відмови (recesso)».</p>
  `;

  const results = await Promise.allSettled([
    transporterOrders.sendMail({
      from: `"On-Smart" <${process.env.MAIL_USER_ORDERS}>`,
      to: params.to,
      subject: `Conferma ricezione dichiarazione di recesso — Ordine ${params.orderNumber}`,
      html: emailShell("Dichiarazione di recesso ricevuta", customerBody),
    }),
    transporterOrders.sendMail({
      from: `"On-Smart Store" <${process.env.MAIL_USER_ORDERS}>`,
      to: process.env.MAIL_USER_ORDERS,
      replyTo: params.to,
      subject: `[RECESSO] #${params.orderNumber} - ${nome}`,
      html: emailShell("Nuova dichiarazione di recesso", ownerBody),
    }),
  ]);

  const [customer, owner] = results;
  if (customer.status === "rejected") {
    console.error("[sendWithdrawalMails] customer receipt failed:", customer.reason);
  }
  if (owner.status === "rejected") {
    console.error("[sendWithdrawalMails] owner copy failed:", owner.reason);
  }

  return {
    customerSent: customer.status === "fulfilled",
    ownerSent: owner.status === "fulfilled",
  };
}
