"use server";

import { URL_DASHBOARD } from "@/app/(admin)/admin/dashboard/dashboard-admin.types";
import { baseUrl } from "@/types/baseUrl";

const BASE_URL = baseUrl;

const isLocalhost =
  !BASE_URL ||
  BASE_URL.includes("localhost") ||
  BASE_URL.includes("127.0.0.1") ||
  BASE_URL.startsWith("http://localhost");

export async function sendTelegramMessage({
  orderNumber,
  customerDisplayName,
  total,
  paymentMethod,
  deliveryMethod,
  email,
  numeroTelefono,
  orderId,
  deliveryPrice,
}: {
  orderNumber: string;
  orderId: string;
  customerDisplayName: string;
  total: string;
  paymentMethod: string;
  deliveryMethod: string;
  email: string;
  numeroTelefono: string;
  deliveryPrice: string;
}) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token) return { errore: "Missing TG_BOT_TOKEN" };
  if (!chatId) return { errore: "Missing TG_CHAT_ID" };

  const reply_markup = isLocalhost
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
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `<b>🛒 NUOVO ORDINE</b> #${orderNumber}
👤 Cliente: ${customerDisplayName}
💶 Totale: <b>${total} €</b>
💳 Pagamento: ${paymentMethod}
🚚 Consegna: ${deliveryMethod}
💰 Spese di consegna: ${deliveryPrice} €
📧 Email: ${email}
📱 Tel: ${numeroTelefono}`.trim(),
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
