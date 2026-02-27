import type { OrderItemsTypes, OrderTypes } from "@/db/schemas/orders.schema";

export const EMPTY_VALUE = "-";

export function formatDate(value: Date | null | undefined) {
  if (!value) return EMPTY_VALUE;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCurrencyEUR(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value ?? 0);
}

export function centsFromAny(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function safeValue(value: unknown) {
  if (value === null || value === undefined) return EMPTY_VALUE;
  if (typeof value === "string") return value.trim() || EMPTY_VALUE;
  return String(value);
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Очікує оплату",
  PAID: "Оплачено",
  PROCESSING: "В обробці",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  COMPLETED: "Завершено",
  CANCELED: "Скасовано",
  FAILED: "Помилка",
  REFUNDED: "Повернено",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: "Створено",
  SUCCESS: "Оплачено",
  PAYED: "Оплачено",
  FAILED: "Помилка",
  CANCELED: "Скасовано",
  PENDING_BONIFICO: "Очікує банківський переказ",
  PENDING: "Очікує",
};

const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  paypal: "PayPal",
  sumup: "SumUp",
  klarna: "Klarna",
  bonifico: "Банківський переказ",
};

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  CONSEGNA_CORRIERE: "Кур'єрська доставка",
  RITIRO_NEGOZIO: "Самовивіз з магазину",
};

const CLIENT_TYPE_LABELS: Record<string, string> = {
  privato: "Приватна особа",
  azienda: "Організація",
};

export function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? safeValue(status);
}

export function getPaymentStatusLabel(status: string) {
  return PAYMENT_STATUS_LABELS[status] ?? safeValue(status);
}

export function getPaymentProviderLabel(provider: string) {
  return PAYMENT_PROVIDER_LABELS[provider] ?? safeValue(provider);
}

export function getDeliveryMethodLabel(method: string) {
  return DELIVERY_METHOD_LABELS[method] ?? safeValue(method);
}

export function getClientTypeLabel(clientType: string) {
  return CLIENT_TYPE_LABELS[clientType] ?? safeValue(clientType);
}

export function getStatusBadgeClass(status: string) {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
      return "bg-green-500/15 text-green-400 border-green-500/40";
    case "SHIPPED":
    case "PROCESSING":
      return "bg-blue-500/15 text-blue-400 border-blue-500/40";
    case "PENDING_PAYMENT":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/40";
    case "CANCELED":
    case "FAILED":
      return "bg-red-500/15 text-red-400 border-red-500/40";
    default:
      return "bg-neutral-500/15 text-neutral-300 border-neutral-500/40";
  }
}

export function getPaymentStatusBadgeClass(status: string) {
  switch (status) {
    case "SUCCESS":
    case "PAYED":
      return "bg-green-500/15 text-green-400 border-green-500/40";
    case "FAILED":
    case "CANCELED":
      return "bg-red-500/15 text-red-400 border-red-500/40";
    case "PENDING_BONIFICO":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/40";
    case "CREATED":
    default:
      return "bg-blue-500/15 text-blue-400 border-blue-500/40";
  }
}

export function toDateTimeLocalValue(value: Date | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export function buildClientDisplayName(order: Pick<OrderTypes, "nome" | "cognome" | "ragioneSociale">) {
  const fullName = [order.nome, order.cognome].filter(Boolean).join(" ").trim();
  return fullName || order.ragioneSociale || EMPTY_VALUE;
}

export function buildDeliveryLine(
  order: Pick<OrderTypes, "deliveryAdress" | "indirizzo" | "numeroCivico">,
) {
  return [order.deliveryAdress?.indirizzo ?? order.indirizzo ?? "", order.numeroCivico ? `, ${order.numeroCivico}` : ""]
    .join("")
    .trim();
}

export function buildCityLine(
  order: Pick<OrderTypes, "deliveryAdress" | "cap" | "citta" | "provinciaRegione">,
) {
  return [
    order.deliveryAdress?.cap ?? order.cap ?? "",
    order.deliveryAdress?.citta ?? order.citta ?? "",
    order.deliveryAdress?.provincia_regione ?? order.provinciaRegione ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildBillingLine(order: Pick<OrderTypes, "indirizzo" | "numeroCivico">) {
  return [order.indirizzo ?? "", order.numeroCivico ? `, ${order.numeroCivico}` : ""].join("").trim();
}

export function buildBillingCityLine(order: Pick<OrderTypes, "cap" | "citta" | "provinciaRegione">) {
  return [order.cap ?? "", order.citta ?? "", order.provinciaRegione ?? ""].filter(Boolean).join(" ");
}

export function calculateOrderTotals(
  orderItems: OrderItemsTypes[] | null | undefined,
  order: Pick<OrderTypes, "deliveryMethod" | "deliveryPrice"> | null | undefined,
) {
  const itemsSubtotal = (orderItems ?? []).reduce((accumulator, item) => {
    const unitPrice = centsFromAny(item.unitPrice);
    return accumulator + unitPrice * (item.quantity ?? 0);
  }, 0);

  const delivery = order?.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : centsFromAny(order?.deliveryPrice ?? 0);
  const total = itemsSubtotal + delivery;

  return { itemsSubtotal, delivery, total };
}
