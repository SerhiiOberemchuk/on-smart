"use server";

import { URL_DASHBOARD } from "@/app/(admin)/admin/dashboard/dashboard-admin.types";
import { baseUrl } from "@/types/baseUrl";

const BASE_URL = baseUrl;

const isLocalhost =
  !BASE_URL ||
  BASE_URL.includes("localhost") ||
  BASE_URL.includes("127.0.0.1") ||
  BASE_URL.startsWith("http://localhost");

// User-typed values go into a parse_mode=HTML message — escape them.
function escapeTgHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export async function sendTelegramWithdrawalMessage({
  orderNumber,
  orderId,
  nome,
  email,
  note,
  mailSent,
}: {
  orderNumber: string;
  orderId: string | null;
  nome: string;
  email: string;
  note: string | null;
  mailSent: boolean;
}) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token) return { errore: "Missing TG_BOT_TOKEN" };
  if (!chatId) return { errore: "Missing TG_CHAT_ID" };

  const reply_markup =
    isLocalhost || !orderId
      ? undefined
      : {
          inline_keyboard: [
            [
              {
                text: "Apri ordine",
                url:
                  BASE_URL +
                  URL_DASHBOARD.DASHBOARD +
                  URL_DASHBOARD.SUB_DASHBOARD.ORDERS +
                  "/" +
                  orderId,
              },
            ],
          ],
        };

  const lines = [
    `<b>↩️ RICHIESTA DI RECESSO</b> #${escapeTgHtml(orderNumber)}`,
    `👤 Cliente: ${escapeTgHtml(nome)}`,
    `📧 Email: ${escapeTgHtml(email)}`,
    note ? `📝 Note: ${escapeTgHtml(note)}` : null,
    orderId ? null : `⚠️ Ordine non trovato/verificato — controllare manualmente`,
    mailSent ? null : `⚠️ Email di conferma NON inviata — inviare manualmente`,
  ].filter(Boolean);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(reply_markup ? { reply_markup } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Telegram sendMessage failed:", res.status, body);
      throw new Error(`Telegram sendMessage failed: ${res.status} - ${body}`);
    }
    return { message: "Telegram sendMessage successed", response: await res.json() };
  } catch (error) {
    return { error };
  }
}
