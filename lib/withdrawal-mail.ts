import { emailShell } from "@/lib/auth-mail";
import { transporterAssistance } from "@/lib/mail-transporter";

// Art. 54-bis Codice del Consumo: the trader must acknowledge receipt of the
// online withdrawal statement without undue delay, on a durable medium,
// including its content and the date and time of submission.

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

export async function sendWithdrawalReceiptMail(params: {
  to: string;
  nome: string;
  orderNumber: string;
  message: string | null;
  submittedAt: Date;
}): Promise<void> {
  const timestamp = formatWithdrawalTimestamp(params.submittedAt);
  const nome = escapeHtml(params.nome.trim() || "Cliente");

  const body = `
    <p>Gentile ${nome},</p>
    <p>confermiamo di aver ricevuto la tua <strong>dichiarazione di recesso</strong> inviata tramite il nostro sito (art. 54-bis Codice del Consumo).</p>
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">Ordine:</td><td style="padding: 4px 0;"><strong>${escapeHtml(params.orderNumber)}</strong></td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">Nome:</td><td style="padding: 4px 0;">${nome}</td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">Data e ora di invio:</td><td style="padding: 4px 0;"><strong>${timestamp}</strong></td></tr>
      ${params.message ? `<tr><td style="padding: 4px 12px 4px 0; color: #666; vertical-align: top;">Note:</td><td style="padding: 4px 0;">${escapeHtml(params.message)}</td></tr>` : ""}
    </table>
    <p>La tua richiesta verrà gestita al più presto: riceverai le istruzioni per la restituzione del prodotto e per il rimborso a questo indirizzo email.</p>
    <p style="color: #666;">Per qualsiasi domanda scrivi a <a href="mailto:${process.env.MAIL_USER_ASSISTENZA}" style="color: #666;">${process.env.MAIL_USER_ASSISTENZA}</a>.</p>
  `;

  await transporterAssistance.sendMail({
    from: `"On-Smart" <${process.env.MAIL_USER_ASSISTENZA}>`,
    to: params.to,
    subject: `Conferma ricezione dichiarazione di recesso — Ordine ${params.orderNumber}`,
    html: emailShell("Dichiarazione di recesso ricevuta", body),
  });
}
