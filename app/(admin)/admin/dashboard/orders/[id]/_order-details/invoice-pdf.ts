"use client";

import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import type { OrderItemsTypes, OrderPaymentTypes, OrderTypes } from "@/db/schemas/orders.schema";
import { centsFromAny, formatCurrencyEUR, safeValue } from "./formatters";

type DownloadInvoicePdfParams = {
  order: OrderTypes;
  orderItems: OrderItemsTypes[];
  payment: OrderPaymentTypes | null;
  requestInvoice: boolean;
};

type PdfPage = {
  commands: string[];
};

type PdfContext = {
  pages: PdfPage[];
  page: PdfPage;
  y: number;
  header: {
    invoiceCode: string;
    orderNumber: string;
    invoiceDate: string;
  };
};

type PdfColor = [number, number, number];

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 36;
const MARGIN_TOP = PAGE_HEIGHT - 36;
const MARGIN_BOTTOM = 38;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const HEADER_HEIGHT = 88;

const COLORS = {
  white: [1, 1, 1] as PdfColor,
  text: [0.11, 0.13, 0.17] as PdfColor,
  muted: [0.4, 0.43, 0.48] as PdfColor,
  line: [0.82, 0.84, 0.88] as PdfColor,
  accent: [0.12, 0.3, 0.56] as PdfColor,
  accentSoft: [0.91, 0.95, 1] as PdfColor,
  panel: [0.96, 0.97, 0.99] as PdfColor,
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

function normalizePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(value: string) {
  return normalizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function colorToPdf(color: PdfColor) {
  return `${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)}`;
}

function wrapTextByChars(text: string, maxChars: number) {
  if (text.length <= maxChars) return [text];

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxChars) {
      currentLine = candidate;
      continue;
    }
    if (currentLine) lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [text];
}

function wrapTextToWidth(text: string, width: number, fontSize: number) {
  const approxChars = Math.max(10, Math.floor(width / (fontSize * 0.52)));
  return wrapTextByChars(text, approxChars);
}

function estimateTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.52;
}

function addCommand(page: PdfPage, command: string) {
  page.commands.push(command);
}

function drawFilledRect(page: PdfPage, x: number, y: number, width: number, height: number, fillColor: PdfColor) {
  addCommand(page, `q ${colorToPdf(fillColor)} rg ${x} ${y} ${width} ${height} re f Q`);
}

function drawStrokedRect(
  page: PdfPage,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: PdfColor,
  lineWidth = 1,
) {
  addCommand(page, `q ${colorToPdf(strokeColor)} RG ${lineWidth} w ${x} ${y} ${width} ${height} re S Q`);
}

function drawLine(
  page: PdfPage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeColor: PdfColor,
  lineWidth = 1,
) {
  addCommand(page, `q ${colorToPdf(strokeColor)} RG ${lineWidth} w ${x1} ${y1} m ${x2} ${y2} l S Q`);
}

function drawText(
  page: PdfPage,
  text: string,
  x: number,
  y: number,
  options?: {
    font?: "F1" | "F2";
    fontSize?: number;
    color?: PdfColor;
  },
) {
  const normalized = escapePdfText(text || "");
  const font = options?.font ?? "F1";
  const fontSize = options?.fontSize ?? 10;
  const color = options?.color ?? COLORS.text;

  addCommand(page, `q ${colorToPdf(color)} rg BT /${font} ${fontSize} Tf ${x} ${y} Td (${normalized}) Tj ET Q`);
}

function drawTextRight(
  page: PdfPage,
  text: string,
  rightX: number,
  y: number,
  options?: {
    font?: "F1" | "F2";
    fontSize?: number;
    color?: PdfColor;
  },
) {
  const fontSize = options?.fontSize ?? 10;
  const width = estimateTextWidth(normalizePdfText(text), fontSize);
  const x = rightX - width;
  drawText(page, text, x, y, options);
}

function toDisplayValue(value: unknown) {
  const normalized = safeValue(value);
  return normalized === "-" ? "Non specificato" : normalized;
}

function compactAddress(parts: Array<string | null | undefined>, separator = ", ") {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(separator);
}

function startNewPage(context: PdfContext, isContinuation: boolean) {
  const page: PdfPage = { commands: [] };
  context.pages.push(page);
  context.page = page;

  const headerY = MARGIN_TOP - HEADER_HEIGHT;
  drawFilledRect(page, MARGIN_X, headerY, CONTENT_WIDTH, HEADER_HEIGHT, COLORS.accent);

  drawText(page, "FATTURA", MARGIN_X + 14, MARGIN_TOP - 28, {
    font: "F2",
    fontSize: 18,
    color: COLORS.white,
  });
  drawText(page, CONTACTS_ADDRESS.OWNER.COMPANY_NAME, MARGIN_X + 14, MARGIN_TOP - 45, {
    font: "F2",
    fontSize: 11,
    color: COLORS.white,
  });
  drawText(page, `P.IVA ${CONTACTS_ADDRESS.OWNER.VAT_NUMBER}`, MARGIN_X + 14, MARGIN_TOP - 59, {
    fontSize: 9,
    color: COLORS.white,
  });
  drawText(page, CONTACTS_ADDRESS.EMAIL, MARGIN_X + 14, MARGIN_TOP - 72, {
    fontSize: 9,
    color: COLORS.white,
  });

  drawText(page, `N. fattura ${context.header.invoiceCode}`, MARGIN_X + CONTENT_WIDTH - 210, MARGIN_TOP - 32, {
    font: "F2",
    fontSize: 10,
    color: COLORS.white,
  });
  drawText(page, `Ordine ${context.header.orderNumber}`, MARGIN_X + CONTENT_WIDTH - 210, MARGIN_TOP - 47, {
    fontSize: 9,
    color: COLORS.white,
  });
  drawText(page, `Data ${context.header.invoiceDate}`, MARGIN_X + CONTENT_WIDTH - 210, MARGIN_TOP - 62, {
    fontSize: 9,
    color: COLORS.white,
  });
  if (isContinuation) {
    drawText(page, "Continuazione", MARGIN_X + CONTENT_WIDTH - 210, MARGIN_TOP - 77, {
      fontSize: 8,
      color: COLORS.white,
    });
  }

  context.y = headerY - 20;
}

function ensureSpace(context: PdfContext, requiredHeight: number) {
  if (context.y - requiredHeight < MARGIN_BOTTOM) {
    startNewPage(context, true);
  }
}

function drawSectionTitle(context: PdfContext, title: string) {
  ensureSpace(context, 26);
  drawText(context.page, title, MARGIN_X, context.y, {
    font: "F2",
    fontSize: 11,
    color: COLORS.text,
  });
  context.y -= 7;
  drawLine(context.page, MARGIN_X, context.y, MARGIN_X + CONTENT_WIDTH, context.y, COLORS.line, 1);
  context.y -= 16;
}

function drawKeyValueRow(
  context: PdfContext,
  label: string,
  value: string,
  options?: {
    labelWidth?: number;
    fontSize?: number;
  },
) {
  const labelWidth = options?.labelWidth ?? 130;
  const fontSize = options?.fontSize ?? 10;
  const valueX = MARGIN_X + labelWidth;
  const valueWidth = CONTENT_WIDTH - labelWidth;
  const wrappedLines = wrapTextToWidth(value, valueWidth, fontSize);
  const rowHeight = Math.max(14, wrappedLines.length * 13) + 2;

  ensureSpace(context, rowHeight);
  drawText(context.page, label, MARGIN_X, context.y, {
    font: "F2",
    fontSize: 8.5,
    color: COLORS.muted,
  });

  wrappedLines.forEach((line, index) => {
    drawText(context.page, line, valueX, context.y - index * 13, {
      fontSize,
      color: COLORS.text,
    });
  });

  context.y -= rowHeight;
}

function drawItemsTableHeader(context: PdfContext) {
  const tableX = MARGIN_X;
  const tableY = context.y - 16;
  const tableWidth = CONTENT_WIDTH;
  const headerHeight = 20;

  drawFilledRect(context.page, tableX, tableY, tableWidth, headerHeight, COLORS.accentSoft);
  drawStrokedRect(context.page, tableX, tableY, tableWidth, headerHeight, COLORS.line, 0.8);

  drawText(context.page, "Descrizione", tableX + 8, context.y - 2, {
    font: "F2",
    fontSize: 9,
  });
  drawTextRight(context.page, "Qta", tableX + 348, context.y - 2, {
    font: "F2",
    fontSize: 9,
  });
  drawTextRight(context.page, "Prezzo", tableX + 440, context.y - 2, {
    font: "F2",
    fontSize: 9,
  });
  drawTextRight(context.page, "Totale", tableX + tableWidth - 8, context.y - 2, {
    font: "F2",
    fontSize: 9,
  });

  context.y -= 24;
}

function drawItemsTable(
  context: PdfContext,
  orderItems: OrderItemsTypes[],
  itemSubtotal: number,
  deliveryPrice: number,
  totalPrice: number,
) {
  drawSectionTitle(context, "Articoli");
  drawItemsTableHeader(context);

  const items = orderItems.length > 0 ? orderItems : null;
  if (!items) {
    drawKeyValueRow(context, "Dettaglio", "Nessun articolo presente in questo ordine.");
    return;
  }

  for (const [index, item] of items.entries()) {
    const itemDescriptionBase = [item.title, [item.brandName, item.categoryName].filter(Boolean).join(" / ")]
      .filter(Boolean)
      .join(" | ");
    const description = `${index + 1}. ${itemDescriptionBase}`;
    const unitPrice = centsFromAny(item.unitPrice);
    const rowTotal = unitPrice * (item.quantity ?? 0);

    const rowLines = wrapTextToWidth(description, 295, 9.5);
    const rowHeight = Math.max(18, rowLines.length * 12 + 8);

    if (context.y - rowHeight < MARGIN_BOTTOM + 100) {
      startNewPage(context, true);
      drawSectionTitle(context, "Articoli");
      drawItemsTableHeader(context);
    }

    rowLines.forEach((line, lineIndex) => {
      drawText(context.page, line, MARGIN_X + 8, context.y - lineIndex * 12, {
        fontSize: 9.5,
      });
    });

    drawTextRight(context.page, String(item.quantity ?? 0), MARGIN_X + 348, context.y, {
      fontSize: 9.5,
    });
    drawTextRight(context.page, formatCurrencyEUR(unitPrice), MARGIN_X + 440, context.y, {
      fontSize: 9.5,
    });
    drawTextRight(context.page, formatCurrencyEUR(rowTotal), MARGIN_X + CONTENT_WIDTH - 8, context.y, {
      fontSize: 9.5,
    });

    drawLine(context.page, MARGIN_X, context.y - rowHeight + 2, MARGIN_X + CONTENT_WIDTH, context.y - rowHeight + 2, COLORS.line, 0.7);
    context.y -= rowHeight;
  }

  ensureSpace(context, 82);
  const totalsBoxWidth = 210;
  const totalsBoxHeight = 66;
  const totalsBoxX = MARGIN_X + CONTENT_WIDTH - totalsBoxWidth;
  const totalsBoxY = context.y - totalsBoxHeight;

  drawFilledRect(context.page, totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight, COLORS.panel);
  drawStrokedRect(context.page, totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight, COLORS.line, 1);

  drawText(context.page, "Subtotale", totalsBoxX + 10, context.y - 17, {
    fontSize: 9.5,
    color: COLORS.muted,
  });
  drawTextRight(context.page, formatCurrencyEUR(itemSubtotal), totalsBoxX + totalsBoxWidth - 10, context.y - 17, {
    fontSize: 9.5,
  });

  drawText(context.page, "Consegna", totalsBoxX + 10, context.y - 32, {
    fontSize: 9.5,
    color: COLORS.muted,
  });
  drawTextRight(context.page, formatCurrencyEUR(deliveryPrice), totalsBoxX + totalsBoxWidth - 10, context.y - 32, {
    fontSize: 9.5,
  });

  drawLine(context.page, totalsBoxX + 10, context.y - 39, totalsBoxX + totalsBoxWidth - 10, context.y - 39, COLORS.line, 0.8);

  drawText(context.page, "Totale", totalsBoxX + 10, context.y - 53, {
    font: "F2",
    fontSize: 10.5,
  });
  drawTextRight(context.page, formatCurrencyEUR(totalPrice), totalsBoxX + totalsBoxWidth - 10, context.y - 53, {
    font: "F2",
    fontSize: 10.5,
  });

  context.y -= totalsBoxHeight + 16;
}

function buildPdfDocument(pages: PdfPage[]) {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const catalogObjectId = 1;
  const pagesObjectId = 2;
  const fontRegularObjectId = 3;
  const fontBoldObjectId = 4;
  let nextObjectId = 5;

  for (const page of pages) {
    const pageObjectId = nextObjectId++;
    const contentObjectId = nextObjectId++;
    pageObjectIds.push(pageObjectId);

    const stream = page.commands.join("\n");
    objects[pageObjectId] =
      `<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontRegularObjectId} 0 R /F2 ${fontBoldObjectId} 0 R >> >> ` +
      `/Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  objects[catalogObjectId] = `<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`;
  objects[pagesObjectId] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;
  objects[fontRegularObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[fontBoldObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  const maxObjectId = nextObjectId - 1;
  const offsets: number[] = [0];
  let documentBody = "%PDF-1.4\n";

  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    offsets[objectId] = documentBody.length;
    documentBody += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }

  const xrefOffset = documentBody.length;
  documentBody += `xref\n0 ${maxObjectId + 1}\n`;
  documentBody += "0000000000 65535 f \n";
  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    documentBody += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`;
  }
  documentBody += `trailer\n<< /Size ${maxObjectId + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return documentBody;
}

function triggerPdfDownload(pdfDocument: string, fileName: string) {
  const blob = new Blob([pdfDocument], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function buildInvoicePdfPages({ order, orderItems, payment, requestInvoice }: DownloadInvoicePdfParams) {
  const invoiceCode = `INV-${order.orderNumber}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("it-IT");
  const itemSubtotal = orderItems.reduce((acc, item) => acc + centsFromAny(item.unitPrice) * (item.quantity ?? 0), 0);
  const deliveryPrice = order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : centsFromAny(order.deliveryPrice);
  const totalPrice = itemSubtotal + deliveryPrice;

  const customerName =
    order.clientType === "azienda"
      ? toDisplayValue(order.ragioneSociale || [order.nome, order.cognome].filter(Boolean).join(" ").trim())
      : toDisplayValue([order.nome, order.cognome].filter(Boolean).join(" ").trim());

  const billingLine1 = compactAddress([order.indirizzo, order.numeroCivico]);
  const billingLine2 = compactAddress([order.cap, order.citta, order.provinciaRegione], " ");
  const billingCountry = toDisplayValue(order.nazione);

  const delivery = order.deliveryAdress;
  const shippingLine1 = toDisplayValue(delivery?.indirizzo || billingLine1);
  const shippingLine2 = toDisplayValue(
    compactAddress([delivery?.cap ?? order.cap, delivery?.citta ?? order.citta, delivery?.provincia_regione ?? order.provinciaRegione], " "),
  );
  const shippingCountry = toDisplayValue(delivery?.nazione ?? order.nazione);

  const sellerAddress = compactAddress(
    [
      CONTACTS_ADDRESS.ADDRESS.STREET,
      `${CONTACTS_ADDRESS.ADDRESS.POSTAL_CODE} ${CONTACTS_ADDRESS.ADDRESS.CITY} (${CONTACTS_ADDRESS.ADDRESS.REGION})`,
      CONTACTS_ADDRESS.ADDRESS.COUNTRY,
    ],
    ", ",
  );

  const context: PdfContext = {
    pages: [],
    page: { commands: [] },
    y: MARGIN_TOP,
    header: {
      invoiceCode,
      orderNumber: order.orderNumber,
      invoiceDate,
    },
  };

  startNewPage(context, false);

  drawSectionTitle(context, "Dati venditore");
  drawKeyValueRow(context, "Azienda", CONTACTS_ADDRESS.OWNER.COMPANY_NAME);
  drawKeyValueRow(context, "Partita IVA", CONTACTS_ADDRESS.OWNER.VAT_NUMBER);
  drawKeyValueRow(context, "Email", CONTACTS_ADDRESS.EMAIL);
  drawKeyValueRow(context, "Indirizzo", sellerAddress);
  context.y -= 6;

  drawSectionTitle(context, "Dati cliente");
  drawKeyValueRow(context, "Tipo cliente", CLIENT_TYPE_LABELS[order.clientType]);
  drawKeyValueRow(context, "Nome / Azienda", customerName);
  drawKeyValueRow(context, "Email", toDisplayValue(order.email));
  drawKeyValueRow(context, "Telefono", toDisplayValue(order.numeroTelefono));
  drawKeyValueRow(context, "Indirizzo fatturazione", toDisplayValue(billingLine1));
  drawKeyValueRow(context, "CAP / Citta / Provincia", toDisplayValue(billingLine2));
  drawKeyValueRow(context, "Nazione", billingCountry);
  drawKeyValueRow(context, "Fattura richiesta", requestInvoice ? "Si" : "No");

  if (order.clientType === "azienda") {
    drawKeyValueRow(context, "Ragione sociale", toDisplayValue(order.ragioneSociale));
    drawKeyValueRow(context, "Partita IVA cliente", toDisplayValue(order.partitaIva));
    drawKeyValueRow(context, "PEC", toDisplayValue(order.pecAzzienda));
    drawKeyValueRow(context, "Codice SDI", toDisplayValue(order.codiceUnico));
  } else if (requestInvoice) {
    drawKeyValueRow(context, "Codice fiscale", toDisplayValue(order.codiceFiscale));
  }

  context.y -= 6;
  drawSectionTitle(context, "Consegna");
  drawKeyValueRow(context, "Metodo", DELIVERY_METHOD_LABELS[order.deliveryMethod]);
  drawKeyValueRow(context, "Indirizzo", shippingLine1);
  drawKeyValueRow(context, "CAP / Citta / Provincia", shippingLine2);
  drawKeyValueRow(context, "Nazione", shippingCountry);

  if (delivery?.referente_contatto) {
    drawKeyValueRow(context, "Referente", toDisplayValue(delivery.referente_contatto));
  }

  drawItemsTable(context, orderItems, itemSubtotal, deliveryPrice, totalPrice);

  drawSectionTitle(context, "Pagamento");
  drawKeyValueRow(context, "Metodo", PAYMENT_PROVIDER_LABELS[payment?.provider ?? ""] ?? toDisplayValue(payment?.provider));
  drawKeyValueRow(context, "Stato", PAYMENT_STATUS_LABELS[payment?.status ?? ""] ?? toDisplayValue(payment?.status));
  drawKeyValueRow(context, "ID transazione", toDisplayValue(payment?.providerOrderId));
  drawKeyValueRow(context, "Importo", formatCurrencyEUR(centsFromAny(payment?.amount ?? totalPrice)));

  ensureSpace(context, 28);
  drawLine(context.page, MARGIN_X, context.y, MARGIN_X + CONTENT_WIDTH, context.y, COLORS.line, 1);
  context.y -= 14;
  drawText(
    context.page,
    "Documento generato automaticamente dal sistema amministrativo On Smart.",
    MARGIN_X,
    context.y,
    {
      fontSize: 8.5,
      color: COLORS.muted,
    },
  );

  return context.pages;
}

export function downloadInvoicePdf(params: DownloadInvoicePdfParams) {
  if (typeof window === "undefined") return;

  const pages = buildInvoicePdfPages(params);
  const pdfDocument = buildPdfDocument(pages);
  const fileName = `invoice-${params.order.orderNumber}.pdf`;

  triggerPdfDownload(pdfDocument, fileName);
}
