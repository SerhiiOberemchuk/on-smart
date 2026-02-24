"use server";

import { URL_DASHBOARD } from "@/app/(admin)/admin/dashboard/dashboard-admin.types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;
export async function sendTelegramMessage({
  orderNumber,
  customerDisplayName,
  total,
  paymentMethod,
  deliveryMethod,
  email,
  numeroTelefono,
  orderId,
}: {
  orderNumber: string;
  orderId: string;
  customerDisplayName: string;
  total: string;
  paymentMethod: string;
  deliveryMethod: string;
  email: string;
  numeroTelefono: string;
}) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token) return { errore: "Missing TG_BOT_TOKEN" };
  if (!chatId) return { errore: "Missing TG_CHAT_ID" };
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

📧 Email: ${email}
📱 Tel: ${numeroTelefono}
`.trim(),
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: {
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
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { message: `Telegram sendMessage failed: ${res.status} ${body}` };
    }
    return { message: "Telegram sendMessage successed" };
  } catch (error) {
    return { error };
  }
}
