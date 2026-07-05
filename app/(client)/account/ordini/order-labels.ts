import type { OrderStatusTypes } from "@/types/orders.types";
import type { PaymentStatusTypes } from "@/types/payments.types";

export const ORDER_STATUS_LABEL: Record<OrderStatusTypes, string> = {
  PENDING_PAYMENT: "In attesa di pagamento",
  PAID: "Pagato",
  FULFILLING: "In preparazione",
  SHIPPED: "Spedito",
  READY_FOR_PICKUP: "Pronto per il ritiro",
  COMPLETED: "Completato",
  CANCELED: "Annullato",
  REFUNDED: "Rimborsato",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatusTypes, string> = {
  CREATED: "Creato",
  SUCCESS: "Pagato",
  PAYED: "Pagato",
  FAILED: "Fallito",
  CANCELED: "Annullato",
  PENDING_BONIFICO: "In attesa di bonifico",
  PENDING: "In sospeso",
};

export function formatOrderDate(date: Date): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
