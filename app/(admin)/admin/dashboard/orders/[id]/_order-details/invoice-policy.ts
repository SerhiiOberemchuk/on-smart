import type { ClientType } from "@/types/orders.types";

export function canGenerateInvoice(clientType: ClientType, requestInvoice: boolean) {
  if (clientType === "azienda") return true;
  return requestInvoice;
}

export function getInvoiceAvailabilityReason(clientType: ClientType, requestInvoice: boolean) {
  if (canGenerateInvoice(clientType, requestInvoice)) return null;
  return "Для приватного клієнта увімкніть «Потрібен рахунок», щоб згенерувати PDF-рахунок.";
}
