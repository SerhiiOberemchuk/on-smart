"use client";

import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import type { OrderItemsTypes, OrderPaymentTypes, OrderTypes } from "@/db/schemas/orders.schema";
import jsPDF from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import { centsFromAny, formatCurrencyEUR, safeValue } from "./formatters";

type DownloadInvoicePdfParams = {
  order: OrderTypes;
  orderItems: OrderItemsTypes[];
  payment: OrderPaymentTypes | null;
  requestInvoice: boolean;
};

const CLIENT_TYPE_LABELS: Record<OrderTypes["clientType"], string> = {
  privato: "Privato",
  azienda: "Azienda",
};

const DELIVERY_METHOD_LABELS: Record<OrderTypes["deliveryMethod"], string> = {
  CONSEGNA_CORRIERE: "Consegna con corriere",
  RITIRO_NEGOZIO: "Ritiro in negozio",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: "Creato",
  SUCCESS: "Pagato",
  PAYED: "Pagato",
  FAILED: "Fallito",
  CANCELED: "Annullato",
  PENDING_BONIFICO: "In attesa di bonifico",
  PENDING: "In attesa",
};

const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  paypal: "PayPal",
  sumup: "SumUp",
  klarna: "Klarna",
  bonifico: "Bonifico bancario",
};

const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  А: "A",
  Б: "B",
  В: "V",
  Г: "H",
  Ґ: "G",
  Д: "D",
  Е: "E",
  Є: "Ye",
  Ж: "Zh",
  З: "Z",
  И: "Y",
  І: "I",
  Ї: "Yi",
  Й: "Y",
  К: "K",
  Л: "L",
  М: "M",
  Н: "N",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  У: "U",
  Ф: "F",
  Х: "Kh",
  Ц: "Ts",
  Ч: "Ch",
  Ш: "Sh",
  Щ: "Shch",
  Ь: "",
  Ю: "Yu",
  Я: "Ya",
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "iu",
  я: "ia",
  Ё: "Yo",
  ё: "yo",
  Ъ: "",
  ъ: "",
  Ы: "Y",
  ы: "y",
  Э: "E",
  э: "e",
};

function countControlChars(value: string) {
  let total = 0;
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 32 || code === 127) total += 1;
  }
  return total;
}

function scoreReadableText(value: string) {
  let score = 0;
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code >= 32 && code !== 127) score += 1;
    else score -= 3;
  }
  return score;
}

function tryDecodeBytesAsEncoding(input: string, encoding: string) {
  try {
    const bytes = Uint8Array.from(Array.from(input).map((char) => char.charCodeAt(0) & 0xff));
    if (bytes.length < 2) return null;
    const decoded = new TextDecoder(encoding, { fatal: true }).decode(bytes);
    return decoded;
  } catch {
    return null;
  }
}

function fixPotentialMojibake(input: string) {
  const candidates = [input];

  if (/[\u0000-\u001f]/.test(input)) {
    const decodedUtf16Be = tryDecodeBytesAsEncoding(input, "utf-16be");
    if (decodedUtf16Be) candidates.push(decodedUtf16Be);
  }

  const decodedUtf8 = tryDecodeBytesAsEncoding(input, "utf-8");
  if (decodedUtf8) candidates.push(decodedUtf8);

  let best = input;
  for (const candidate of candidates) {
    const candidateScore = scoreReadableText(candidate) - countControlChars(candidate) * 2;
    const bestScore = scoreReadableText(best) - countControlChars(best) * 2;
    if (candidateScore > bestScore) {
      best = candidate;
    }
  }

  return best;
}

function transliterateCyrillic(value: string) {
  return value.replace(/[А-Яа-яЁёІіЇїЄєҐґЪъЫыЭэ]/g, (char) => CYRILLIC_TO_LATIN_MAP[char] ?? char);
}

function toReadablePdfText(value: string) {
  const decoded = fixPotentialMojibake(value);
  const transliterated = transliterateCyrillic(decoded);
  return transliterated.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function displayValue(value: unknown) {
  const normalized = safeValue(value);
  if (normalized === "-") return "Non specificato";
  return toReadablePdfText(normalized);
}

function compactAddress(parts: Array<string | null | undefined>, separator = ", ") {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(separator);
}

function fullClientName(order: OrderTypes) {
  const fullName = [order.nome, order.cognome].filter(Boolean).join(" ").trim();
  if (order.clientType === "azienda") {
    return displayValue(order.ragioneSociale || fullName);
  }
  return displayValue(fullName);
}

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number, width: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 32, 44);
  doc.text(title, x, y);
  doc.setDrawColor(220, 226, 235);
  doc.line(x, y + 2, x + width, y + 2);
}

function drawKeyValueRows(
  doc: jsPDF,
  rows: Array<{ label: string; value: string }>,
  x: number,
  y: number,
  width: number,
  labelWidth = 40,
) {
  let currentY = y;

  for (const row of rows) {
    const valueLines = doc.splitTextToSize(row.value, width - labelWidth - 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(89, 102, 122);
    doc.text(row.label, x, currentY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 32, 44);
    doc.text(valueLines, x + labelWidth, currentY);

    currentY += Math.max(5.5, valueLines.length * 4.6);
  }

  return currentY;
}

function drawCardBackground(doc: jsPDF, x: number, y: number, width: number, height: number) {
  doc.setFillColor(248, 250, 253);
  doc.roundedRect(x, y, width, height, 1.8, 1.8, "F");
  doc.setDrawColor(227, 232, 240);
  doc.roundedRect(x, y, width, height, 1.8, 1.8, "S");
}

function addPageNumbers(doc: jsPDF, margin: number) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(115, 126, 143);

  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    doc.setPage(pageIndex);
    doc.text(`Pagina ${pageIndex} di ${pageCount}`, pageWidth - margin, pageHeight - 7, {
      align: "right",
    });
  }
}

export function downloadInvoicePdf({ order, orderItems, payment, requestInvoice }: DownloadInvoicePdfParams) {
  if (typeof window === "undefined") return;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const invoiceCode = `INV-${order.orderNumber}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("it-IT");

  const sellerAddress = compactAddress(
    [
      CONTACTS_ADDRESS.ADDRESS.STREET,
      `${CONTACTS_ADDRESS.ADDRESS.POSTAL_CODE} ${CONTACTS_ADDRESS.ADDRESS.CITY} (${CONTACTS_ADDRESS.ADDRESS.REGION})`,
      CONTACTS_ADDRESS.ADDRESS.COUNTRY,
    ],
    ", ",
  );

  const billingAddressLine = compactAddress([order.indirizzo, order.numeroCivico], ", ");
  const billingCityLine = compactAddress([order.cap, order.citta, order.provinciaRegione], " ");

  const deliveryAddress = order.deliveryAdress;
  const shippingAddressLine = compactAddress(
    [deliveryAddress?.indirizzo ?? order.indirizzo, order.numeroCivico],
    ", ",
  );
  const shippingCityLine = compactAddress(
    [deliveryAddress?.cap ?? order.cap, deliveryAddress?.citta ?? order.citta, deliveryAddress?.provincia_regione ?? order.provinciaRegione],
    " ",
  );

  const itemsSubtotal = orderItems.reduce(
    (acc, item) => acc + centsFromAny(item.unitPrice) * (item.quantity ?? 0),
    0,
  );
  const deliveryPrice = order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : centsFromAny(order.deliveryPrice);
  const totalPrice = itemsSubtotal + deliveryPrice;

  doc.setFillColor(27, 63, 123);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("FATTURA", margin, 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(CONTACTS_ADDRESS.OWNER.COMPANY_NAME, margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`P.IVA ${CONTACTS_ADDRESS.OWNER.VAT_NUMBER}`, margin, 25.5);
  doc.text(CONTACTS_ADDRESS.EMAIL, margin, 30.3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`N. fattura ${invoiceCode}`, pageWidth - margin, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Ordine ${order.orderNumber}`, pageWidth - margin, 19.2, { align: "right" });
  doc.text(`Data ${invoiceDate}`, pageWidth - margin, 24.8, { align: "right" });
  doc.text(`Stato ordine ${displayValue(order.orderStatus)}`, pageWidth - margin, 30.4, { align: "right" });

  let y = 46;

  drawSectionTitle(doc, "Dati venditore", margin, y, contentWidth);
  y += 8;
  y = drawKeyValueRows(
    doc,
    [
      { label: "Azienda", value: CONTACTS_ADDRESS.OWNER.COMPANY_NAME },
      { label: "Partita IVA", value: CONTACTS_ADDRESS.OWNER.VAT_NUMBER },
      { label: "Email", value: CONTACTS_ADDRESS.EMAIL },
      { label: "Indirizzo", value: sellerAddress },
    ],
    margin,
    y,
    contentWidth,
  );

  y += 4;
  drawSectionTitle(doc, "Cliente e consegna", margin, y, contentWidth);
  y += 8;

  const columnGap = 6;
  const cardWidth = (contentWidth - columnGap) / 2;
  const cardHeight = 52;
  const leftCardX = margin;
  const rightCardX = margin + cardWidth + columnGap;
  const cardY = y;

  drawCardBackground(doc, leftCardX, cardY, cardWidth, cardHeight);
  drawCardBackground(doc, rightCardX, cardY, cardWidth, cardHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(26, 32, 44);
  doc.text("Cliente", leftCardX + 4, cardY + 7);
  doc.text("Consegna", rightCardX + 4, cardY + 7);

  drawKeyValueRows(
    doc,
    [
      { label: "Tipo", value: CLIENT_TYPE_LABELS[order.clientType] },
      { label: "Nome", value: fullClientName(order) },
      { label: "Email", value: displayValue(order.email) },
      { label: "Telefono", value: displayValue(order.numeroTelefono) },
      { label: "Fattura", value: requestInvoice ? "Richiesta" : "Non richiesta" },
    ],
    leftCardX + 4,
    cardY + 12,
    cardWidth - 8,
    22,
  );

  drawKeyValueRows(
    doc,
    [
      { label: "Metodo", value: DELIVERY_METHOD_LABELS[order.deliveryMethod] },
      { label: "Via", value: displayValue(shippingAddressLine) },
      { label: "Citta", value: displayValue(shippingCityLine) },
      { label: "Nazione", value: displayValue(deliveryAddress?.nazione ?? order.nazione) },
    ],
    rightCardX + 4,
    cardY + 12,
    cardWidth - 8,
    18,
  );

  y += cardHeight + 8;
  drawSectionTitle(doc, "Dettagli fiscali", margin, y, contentWidth);
  y += 8;

  const fiscalRows: Array<{ label: string; value: string }> = [
    { label: "Indirizzo fatturazione", value: displayValue(billingAddressLine) },
    { label: "CAP / Citta / Provincia", value: displayValue(billingCityLine) },
    { label: "Nazione", value: displayValue(order.nazione) },
  ];

  if (order.clientType === "azienda") {
    fiscalRows.push({ label: "Ragione sociale", value: displayValue(order.ragioneSociale) });
    fiscalRows.push({ label: "Partita IVA cliente", value: displayValue(order.partitaIva) });
    fiscalRows.push({ label: "PEC", value: displayValue(order.pecAzzienda) });
    fiscalRows.push({ label: "Codice SDI", value: displayValue(order.codiceUnico) });
  } else if (requestInvoice) {
    fiscalRows.push({ label: "Codice fiscale", value: displayValue(order.codiceFiscale) });
  }

  y = drawKeyValueRows(doc, fiscalRows, margin, y, contentWidth);
  y += 3;

  drawSectionTitle(doc, "Articoli", margin, y, contentWidth);
  y += 6;

  const itemRows: RowInput[] =
    orderItems.length > 0
      ? orderItems.map((item, index) => {
          const unitPrice = centsFromAny(item.unitPrice);
          const rowTotal = unitPrice * (item.quantity ?? 0);
          const itemDescription = [item.title, [item.brandName, item.categoryName].filter(Boolean).join(" / ")]
            .filter(Boolean)
            .join(" | ");

          return [
            String(index + 1),
            itemDescription || "Articolo",
            String(item.quantity ?? 0),
            formatCurrencyEUR(unitPrice),
            formatCurrencyEUR(rowTotal),
          ];
        })
      : [["-", "Nessun articolo presente", "-", "-", "-"]];

  autoTable(doc, {
    startY: y,
    head: [["#", "Descrizione", "Qta", "Prezzo unit.", "Totale"]],
    body: itemRows,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2.2,
      lineColor: [227, 232, 240],
      lineWidth: 0.1,
      textColor: [26, 32, 44],
    },
    headStyles: {
      fillColor: [238, 244, 255],
      textColor: [35, 55, 95],
      fontStyle: "bold",
      lineColor: [209, 220, 243],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 104 },
      2: { cellWidth: 18, halign: "right" },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 26, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  const finalTableY =
    (
      doc as jsPDF & {
        lastAutoTable?: { finalY?: number };
      }
    ).lastAutoTable?.finalY ?? y + 20;

  y = finalTableY + 6;
  const totalsBlockWidth = 72;
  const totalsBlockHeight = 25;

  if (y + totalsBlockHeight + 45 > pageHeight) {
    doc.addPage();
    y = margin + 4;
  }

  const totalsX = pageWidth - margin - totalsBlockWidth;

  drawCardBackground(doc, totalsX, y, totalsBlockWidth, totalsBlockHeight);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(89, 102, 122);
  doc.text("Subtotale", totalsX + 4, y + 6.5);
  doc.text("Consegna", totalsX + 4, y + 12.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 32, 44);
  doc.text("Totale", totalsX + 4, y + 19.5);

  doc.setFont("helvetica", "normal");
  doc.text(formatCurrencyEUR(itemsSubtotal), totalsX + totalsBlockWidth - 4, y + 6.5, {
    align: "right",
  });
  doc.text(formatCurrencyEUR(deliveryPrice), totalsX + totalsBlockWidth - 4, y + 12.5, {
    align: "right",
  });
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrencyEUR(totalPrice), totalsX + totalsBlockWidth - 4, y + 19.5, {
    align: "right",
  });

  y += totalsBlockHeight + 8;

  drawSectionTitle(doc, "Pagamento", margin, y, contentWidth);
  y += 8;
  y = drawKeyValueRows(
    doc,
    [
      { label: "Metodo", value: PAYMENT_PROVIDER_LABELS[payment?.provider ?? ""] ?? displayValue(payment?.provider) },
      { label: "Stato", value: PAYMENT_STATUS_LABELS[payment?.status ?? ""] ?? displayValue(payment?.status) },
      { label: "ID transazione", value: displayValue(payment?.providerOrderId) },
      { label: "Importo", value: formatCurrencyEUR(centsFromAny(payment?.amount ?? totalPrice)) },
    ],
    margin,
    y,
    contentWidth,
  );

  const footerY = Math.min(pageHeight - 12, y + 10);
  doc.setDrawColor(220, 226, 235);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(115, 126, 143);
  doc.text("Documento generato automaticamente dal sistema amministrativo On Smart.", margin, footerY);

  addPageNumbers(doc, margin);
  doc.save(`invoice-${order.orderNumber}.pdf`);
}
