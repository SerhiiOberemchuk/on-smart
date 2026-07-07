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

// Colored status pill classes — same semantics as the admin order badges so a
// status reads the same colour everywhere. Base is `rounded-full border px-3
// py-1 text-xs`.
export function orderStatusBadgeClass(status: OrderStatusTypes): string {
  switch (status) {
    case "COMPLETED":
      return "border-green-500/40 bg-green-500/15 text-green-300";
    case "PAID":
    case "FULFILLING":
    case "SHIPPED":
    case "READY_FOR_PICKUP":
      return "border-blue-500/40 bg-blue-500/15 text-blue-300";
    case "PENDING_PAYMENT":
      return "border-yellow-500/40 bg-yellow-500/15 text-yellow-500";
    case "CANCELED":
    case "REFUNDED":
      return "border-red-500/40 bg-red-500/15 text-red-300";
    default:
      return "border-stroke-grey bg-white/5 text-text-grey";
  }
}

export function paymentStatusBadgeClass(status: PaymentStatusTypes): string {
  switch (status) {
    case "SUCCESS":
    case "PAYED":
      return "border-green-500/40 bg-green-500/15 text-green-300";
    case "FAILED":
    case "CANCELED":
      return "border-red-500/40 bg-red-500/15 text-red-300";
    case "PENDING_BONIFICO":
    case "PENDING":
    case "CREATED":
      return "border-yellow-500/40 bg-yellow-500/15 text-yellow-500";
    default:
      return "border-stroke-grey bg-white/5 text-text-grey";
  }
}
