"use server";

import { getOrderFullInfoById } from "@/app/actions/orders/get-order";
import { transporterOrders } from "@/lib/mail-transporter";
import { sendTelegramMessage } from "@/app/actions/telegram/send-message";
import { renderOrderEmailTemplate, resolvePaymentTitle } from "@/app/actions/mail/order-mail-template";

export async function notifyOrderById({ orderId }: { orderId: string }) {
  try {
    const info = await getOrderFullInfoById({ id: orderId });

    if (!info.order || !info.orderItems || !info.payments) {
      return { success: false, message: "Order not found" };
    }

    const { order, orderItems, payments } = info;
    const paymentTitle = resolvePaymentTitle(payments.provider);

    const mappedItems = orderItems.map((item) => ({
      name: item.title,
      qnt: item.quantity,
      total: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
    }));

    const { html, customerDisplayName, grandTotal } = renderOrderEmailTemplate({
      orderNumber: order.orderNumber,
      customerData: order,
      dataCheckoutStepConsegna: {
        deliveryAdress: order.deliveryAdress,
        sameAsBilling: order.sameAsBilling,
      },
      paymentTitle,
      orderItems: mappedItems,
    });

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
    } catch (error) {
      console.error("Error sending Telegram message:", error);
    }

    return { success: true };
  } catch (error) {
    console.error("notifyOrderById error:", error);
    return { success: false, error };
  }
}
