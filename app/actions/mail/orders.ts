"use server";

import { ProductType } from "@/db/schemas/product.schema";
import { transporterOrders } from "@/lib/mail-transporter";
import { BasketProductStateItem } from "@/store/checkout-store";
import { MetodsPayment } from "@/types/bonifico.data";
import { InputsCheckoutStep1, InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";

// Тип для вхідних даних функції відправки
type OrderMailPayload = {
  orderNumber: string;
  customerData: Partial<InputsCheckoutStep1>;
  dataCheckoutStepConsegna: InputsCheckoutStep2Consegna;
  dataCheckoutStepPagamento: Partial<MetodsPayment>;
  productsInBasket: ProductType[];
  bascket: BasketProductStateItem[];
};

// Тип для даних, які йдуть суто в HTML-шаблон
type TemplateProps = {
  orderNumber: string;
  customerData: Partial<InputsCheckoutStep1>;
  dataCheckoutStepConsegna: InputsCheckoutStep2Consegna;
  dataCheckoutStepPagamento: Partial<MetodsPayment>;
  orderItems: { name: string; qnt: number; total: string }[];
  grandTotal: string;
  customerDisplayName: string;
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
    const { email, nome, cognome, client_type, ragione_sociale } = customerData;

    if (!email) return { success: false, messaggio: "Email mancante" };

    const customerDisplayName =
      client_type === "azienda"
        ? ragione_sociale || "Azienda"
        : `${nome || ""} ${cognome || ""}`.trim() || "Cliente";

    const orderItems = bascket.map((item) => {
      const product = productsInBasket.find((p) => p.id === item.id);
      const price = parseFloat(product?.price || "0");
      return {
        name: product?.nameFull || "Prodotto",
        qnt: item.qnt,
        total: (price * item.qnt).toFixed(2),
      };
    });

    const grandTotal = orderItems.reduce((acc, item) => acc + parseFloat(item.total), 0).toFixed(2);

    const htmlContent = generateOrderTemplate({
      orderNumber,
      customerData,
      dataCheckoutStepConsegna,
      dataCheckoutStepPagamento,
      orderItems,
      grandTotal,
      customerDisplayName,
    });

    await transporterOrders.sendMail({
      from: `"On-Smart Store" <${process.env.MAIL_USER_ORDERS}>`,
      to: process.env.MAIL_USER_ORDERS,
      replyTo: email,
      subject: `[NUOVO ORDINE] #${orderNumber} - ${customerDisplayName}`,
      html: htmlContent,
    });

    await transporterOrders.sendMail({
      from: `"On-Smart" <${process.env.MAIL_USER_ORDERS}>`,
      to: email,
      subject: `Conferma Ordine #${orderNumber} – On-Smart`,
      html: htmlContent,
    });

    return { success: true, messaggio: "email inviata con successo" };
  } catch (error) {
    console.error("Mail Error:", error);
    return { success: false, messaggio: "Errore durante l'invio dell'email" };
  }
}

function generateOrderTemplate({
  orderNumber,
  customerData,
  dataCheckoutStepConsegna,
  dataCheckoutStepPagamento,
  orderItems,
  grandTotal,
  customerDisplayName,
}: TemplateProps) {
  const isPickup = dataCheckoutStepConsegna.deliveryMethod === "ritiro_negozio";

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
      <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 3px solid #EAB308;">
        <h1 style="margin: 0; color: #333; font-size: 24px;">On-Smart</h1>
        <p style="margin: 5px 0 0; color: #666;">Conferma Ordine #${orderNumber}</p>
      </div>

      <div style="padding: 20px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Dati del Cliente</h2>
        <p style="margin: 5px 0;"><strong>Cliente:</strong> ${customerDisplayName} (${customerData.client_type ?? ""})</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${customerData.email ?? ""}</p>
        <p style="margin: 5px 0;"><strong>Telefono:</strong> ${customerData.numeroTelefono ?? ""}</p>
        ${customerData.codice_fiscale ? `<p style="margin: 5px 0;"><strong>Codice Fiscale:</strong> ${customerData.codice_fiscale}</p>` : ""}
        ${
          customerData.client_type === "azienda"
            ? `<p style="margin: 5px 0;"><strong>Ragione Sociale:</strong> ${customerData.ragione_sociale}</p>
            <p style="margin: 5px 0;"><strong>Partita IVA:</strong> ${customerData.partita_iva}</p>
            <p style="margin: 5px 0;"><strong>Referente Contatto:</strong> ${customerData.referente_contatto}</p>
           `
            : ""
        }
        
        
        <h2 style="font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Spedizione e Pagamento</h2>
        <p style="margin: 5px 0;"><strong>Metodo di Consegna:</strong> ${isPickup ? "Ritiro in Negozio" : "Corriere"}</p>
        <p style="margin: 5px 0;"><strong>Metodo di Pagamento:</strong> ${dataCheckoutStepPagamento.title || dataCheckoutStepPagamento.paymentMethod || ""}</p>
        
        ${
          !isPickup
            ? `
          <p style="margin: 10px 0 5px;"><strong>Indirizzo di Spedizione:</strong></p>
          <p style="margin: 0; color: #555;">
            ${customerData.indirizzo ?? ""}<br>
            ${customerData.cap ?? ""}, ${customerData.città ?? ""} (${customerData.provincia_regione ?? ""})<br>
            ${customerData.nazione ?? ""}
          </p>
        `
            : `<p style="color: #EAB308;"><strong>Il cliente ritirerà l'ordine presso il punto vendita.</strong></p>`
        }

        <h2 style="font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Riepilogo Prodotti</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eee;">Prodotto</th>
              <th style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">Qtà</th>
              <th style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">Totale</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems
              .map(
                (item) => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qnt}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.total} €</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <p style="font-size: 20px; margin: 0;"><strong>Totale Ordine: <span style="color: #EAB308;">${grandTotal} €</span></strong></p>
        </div>
      </div>

      <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        <p>© 2026 On-Smart. Tutti i diritti riservati.</p>
      </div>
    </div>
  `;
}
