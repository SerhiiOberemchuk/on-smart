import { CheckoutTypesDataFirstStep, CheckoutTypesDataStepConsegna } from "@/store/checkout-store";

export type OrderMailItem = {
  name: string;
  qnt: number;
  total: string;
};

type RenderOrderEmailTemplateInput = {
  orderNumber: string;
  customerData: CheckoutTypesDataFirstStep;
  dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna;
  paymentTitle: string;
  orderItems: OrderMailItem[];
};

export function getCustomerDisplayName(customerData: CheckoutTypesDataFirstStep): string {
  if (customerData.clientType === "azienda") {
    return customerData.ragioneSociale || "Azienda";
  }

  const name = `${customerData.nome || ""} ${customerData.cognome || ""}`.trim();
  return name || "Cliente";
}

export function resolvePaymentTitle(paymentRaw?: string | null): string {
  if (paymentRaw === "sumup") return "SumUp";
  if (paymentRaw === "paypal") return "PayPal";
  if (paymentRaw === "klarna") return "Klarna";
  if (paymentRaw === "bonifico") return "Bonifico";
  return paymentRaw || "Pagamento";
}

export function renderOrderEmailTemplate({
  orderNumber,
  customerData,
  dataCheckoutStepConsegna,
  paymentTitle,
  orderItems,
}: RenderOrderEmailTemplateInput): { html: string; customerDisplayName: string; grandTotal: string } {
  const customerDisplayName = getCustomerDisplayName(customerData);
  const isPickup = customerData.deliveryMethod === "RITIRO_NEGOZIO";
  const itemsSubtotal = orderItems.reduce((acc, item) => acc + parseFloat(item.total), 0);
  const deliveryCost = isPickup ? 0 : Number(customerData.deliveryPrice || 0);
  const grandTotal = (itemsSubtotal + deliveryCost).toFixed(2);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
      <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 3px solid #EAB308;">
        <h1 style="margin: 0; color: #333; font-size: 24px;">On-Smart</h1>
        <p style="margin: 5px 0 0; color: #666;">Conferma Ordine #${orderNumber}</p>
      </div>

      <div style="padding: 20px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Dati del Cliente</h2>
        <p style="margin: 5px 0;"><strong>Cliente:</strong> ${customerDisplayName} (${customerData.clientType ?? ""})</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${customerData.email ?? ""}</p>
        <p style="margin: 5px 0;"><strong>Telefono:</strong> ${customerData.numeroTelefono ?? ""}</p>
        <p style="margin: 5px 0;"><strong>Citta:</strong> ${customerData.citta ?? ""}</p>
        <p style="margin: 5px 0;"><strong>Indirizzo:</strong> ${customerData.indirizzo ?? ""}, ${customerData.numeroCivico}</p>
        <p style="margin: 5px 0;"><strong>Provincia:</strong> ${customerData.provinciaRegione ?? ""}</p>

        ${customerData.codiceFiscale && customerData.requestInvoice ? `<p style="margin: 5px 0;"><strong>Il cliente richiede fattura: </strong>Codice Fiscale ${customerData.codiceFiscale}</p>` : ""}
        ${
          customerData.clientType === "azienda"
            ? `
            <p style="margin: 5px 0;"><strong>Referente Contatto:</strong> ${customerData.referenteContatto}</p>
            <p style="margin: 5px 0;"><strong>Ragione Sociale:</strong> ${customerData.ragioneSociale}</p>
            <p style="margin: 5px 0;"><strong>Partita IVA:</strong> ${customerData.partitaIva}</p>
            <p style="margin: 5px 0;"><strong>PEC:</strong> ${customerData.pecAzzienda ?? "--"}</p>
            <p style="margin: 5px 0;"><strong>Codice UNICO:</strong> ${customerData.codiceUnico ?? "--"}</p>
           `
            : ""
        }

        <h2 style="font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Spedizione e Pagamento</h2>
        <p style="margin: 5px 0;"><strong>Metodo di Consegna:</strong> ${isPickup ? "Ritiro in Negozio" : "Corriere"}</p>
        <p style="margin: 5px 0;"><strong>Costo di Spedizione:</strong> ${deliveryCost.toFixed(2)} €</p>
        <p style="margin: 5px 0;"><strong>Metodo di Pagamento:</strong> ${paymentTitle}</p>

        ${
          !isPickup && !dataCheckoutStepConsegna.sameAsBilling
            ? `
          <p style="margin: 10px 0 5px;"><strong>Indirizzo di Spedizione:</strong></p>
          <p style="margin: 5px 0;"><strong>Referente:</strong>${dataCheckoutStepConsegna.deliveryAdress?.referente_contatto ?? ""}</p>
          <p style="margin: 5px 0;"><strong>Ragione sociale:</strong>${dataCheckoutStepConsegna.deliveryAdress?.ragione_sociale ?? ""}</p>
          <p style="margin: 5px 0;"><strong>Indirizzo:</strong>${dataCheckoutStepConsegna.deliveryAdress?.indirizzo ?? ""}</p>
          <p style="margin: 5px 0;"><strong>Citta:</strong>${dataCheckoutStepConsegna.deliveryAdress?.citta ?? ""}</p>
          <p style="margin: 5px 0;"><strong>CAP:</strong>${dataCheckoutStepConsegna.deliveryAdress?.cap ?? ""}</p>
          <p style="margin: 5px 0;"><strong>Nazione:</strong>${dataCheckoutStepConsegna.deliveryAdress?.nazione ?? ""}</p>
          <p style="margin: 5px 0;"><strong>Provincia:</strong>${dataCheckoutStepConsegna.deliveryAdress?.provincia_regione ?? ""}</p>
          `
            : ""
        }
        ${
          !isPickup && dataCheckoutStepConsegna.sameAsBilling
            ? `<p style="margin: 10px 0 5px;"><strong>L'indirizzo di spedizione coincide con l'indirizzo di fatturazione</strong></p>`
            : ""
        }

        ${isPickup ? `<p style="color: #EAB308;"><strong>Il cliente ritirera l'ordine presso il punto vendita.</strong></p>` : ""}

        <h2 style="font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Riepilogo Prodotti</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eee;">Prodotto</th>
              <th style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">Qta</th>
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

  return { html, customerDisplayName, grandTotal };
}
