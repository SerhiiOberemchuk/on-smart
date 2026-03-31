"use server";

import { ProductType } from "@/db/schemas/product.schema";
import { transporterOrders } from "@/lib/mail-transporter";
import {
  BasketTypeUseCheckoutStore,
  CheckoutTypesDataFirstStep,
  CheckoutTypesDataStepConsegna,
} from "@/store/checkout-store";
import { MetodsPayment } from "@/types/bonifico.data";
import { renderOrderEmailTemplate } from "./order-mail-template";

type OrderMailPayload = {
  orderNumber: string;
  customerData: CheckoutTypesDataFirstStep;
  dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna;
  dataCheckoutStepPagamento: Partial<MetodsPayment>;
  productsInBasket: Partial<ProductType>[];
  bascket: BasketTypeUseCheckoutStore;
};

export async function sendMailOrders({
  orderNumber,
  customerData,
  dataCheckoutStepConsegna,
  dataCheckoutStepPagamento,
  productsInBasket,
  bascket,
}: OrderMailPayload) {
  try {
    const { email } = customerData;
    if (!email) return { success: false, messaggio: "Email mancante" };

    const orderItems = bascket.map((item) => {
      const product = productsInBasket.find((p) => p.id === item.productId);
      const price = parseFloat(product?.price || "0");
      return {
        name: product?.nameFull || "Prodotto",
        qnt: item.quantity,
        total: (price * item.quantity).toFixed(2),
      };
    });

    const { html, customerDisplayName } = renderOrderEmailTemplate({
      orderNumber,
      customerData,
      dataCheckoutStepConsegna,
      paymentTitle: dataCheckoutStepPagamento.title || dataCheckoutStepPagamento.paymentMethod || "",
      orderItems,
    });

    await transporterOrders.sendMail({
      from: `"On-Smart Store" <${process.env.MAIL_USER_ORDERS}>`,
      to: process.env.MAIL_USER_ORDERS,
      replyTo: email,
      subject: `[NUOVO ORDINE] #${orderNumber} - ${customerDisplayName}`,
      html,
    });

    await transporterOrders.sendMail({
      from: `"On-Smart" <${process.env.MAIL_USER_ORDERS}>`,
      to: email,
      subject: `Conferma Ordine #${orderNumber} - On-Smart`,
      html,
    });

    return { success: true, messaggio: "email inviata con successo" };
  } catch (error) {
    console.error("Mail Error:", error);
    return { success: false, messaggio: "Errore durante l'invio dell'email" };
  }
}
