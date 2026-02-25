"use server";

import { getOrderFullInfoById } from "@/app/actions/orders/get-order";
import { transporterOrders } from "@/lib/mail-transporter";
import { sendTelegramMessage } from "@/app/actions/telegram/send-message";

export async function notifyOrderById({ orderId }: { orderId: string }) {
  try {
    const info = await getOrderFullInfoById({ id: orderId });

    if (!info.order || !info.orderItems || !info.payments) {
      return { success: false, message: "Order not found" };
    }

    const { order, orderItems, payments } = info;

    const customerDisplayName =
      order.clientType === "azienda"
        ? order.ragioneSociale || "Azienda"
        : `${order.nome ?? ""} ${order.cognome ?? ""}`.trim() || "Cliente";

    const mappedItems = orderItems.map((item) => {
      const total = (parseFloat(item.unitPrice) * item.quantity).toFixed(2);

      return {
        name: item.title,
        qnt: item.quantity,
        total,
      };
    });

    const grandTotal = mappedItems
      .reduce((acc, item) => acc + parseFloat(item.total), 0)
      .toFixed(2);

    const paymentTitle =
      payments.provider === "sumup"
        ? "SumUp"
        : payments.provider === "paypal"
          ? "PayPal"
          : payments.provider === "klarna"
            ? "Klarna"
            : "Bonifico";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; border:1px solid #eee;">
        <div style="background:#f8f8f8; padding:20px; text-align:center; border-bottom:3px solid #EAB308;">
          <h1 style="margin:0;">On-Smart</h1>
          <p style="margin:6px 0 0;">Conferma Ordine #${order.orderNumber}</p>
        </div>

        <div style="padding:20px;">
          <p><strong>Cliente:</strong> ${customerDisplayName} (${order.clientType})</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Telefono:</strong> ${order.numeroTelefono}</p>
          <p><strong>Pagamento:</strong> ${paymentTitle}</p>

          <h3 style="margin-top:20px;">Prodotti</h3>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#f9f9f9;">
                <th style="text-align:left; padding:10px;">Prodotto</th>
                <th style="text-align:center; padding:10px;">Qtà</th>
                <th style="text-align:right; padding:10px;">Totale</th>
              </tr>
            </thead>
            <tbody>
              ${mappedItems
                .map(
                  (i) => `
                <tr>
                  <td style="padding:10px; border-bottom:1px solid #eee;">${i.name}</td>
                  <td style="padding:10px; text-align:center; border-bottom:1px solid #eee;">${i.qnt}</td>
                  <td style="padding:10px; text-align:right; border-bottom:1px solid #eee;">${i.total} €</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div style="text-align:right; margin-top:20px;">
            <strong>Totale Ordine: <span style="color:#EAB308;">${grandTotal} €</span></strong>
          </div>
        </div>
      </div>
    `;

    await transporterOrders.sendMail({
      from: `"On-Smart Store" <${process.env.MAIL_USER_ORDERS}>`,
      to: process.env.MAIL_USER_ORDERS,
      replyTo: order.email,
      subject: `[NUOVO ORDINE] #${order.orderNumber} - ${customerDisplayName}`,
      html,
    });

    await transporterOrders.sendMail({
      from: `"On-Smart" <${process.env.MAIL_USER_ORDERS}>`,
      to: order.email,
      subject: `Conferma Ordine #${order.orderNumber}`,
      html,
    });
    try {
      await sendTelegramMessage({
        orderNumber: order.orderNumber,
        orderId: order.id,
        customerDisplayName,
        total: grandTotal,
        paymentMethod: paymentTitle,
        deliveryMethod: String(order.deliveryMethod ?? "Corriere"),
        email: order.email,
        numeroTelefono: order.numeroTelefono,
        deliveryPrice: order.deliveryPrice.toFixed(2),
      });
      console.log("Telegram message sent successfully");
    } catch (error) {
      console.error("Error sending Telegram message:", error);
    }

    return { success: true };
  } catch (error) {
    console.error("notifyOrderById error:", error);
    return { success: false, error };
  }
}
