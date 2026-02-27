import type { OrderTypes } from "@/db/schemas/orders.schema";
import { safeValue } from "./formatters";

export const DELIVERY_ADDRESS_LABELS: Record<string, string> = {
  cap: "CAP",
  citta: "Citta",
  indirizzo: "Indirizzo",
  nazione: "Nazione",
  partita_iva: "Partita IVA",
  provincia_regione: "Provincia / Regione",
  ragione_sociale: "Ragione sociale",
  referente_contatto: "Referente contatto",
};

export function getDeliveryAddressLabel(key: string) {
  return DELIVERY_ADDRESS_LABELS[key] ?? key.replaceAll("_", " ");
}

export function getDeliveryAddressEntries(deliveryAddress: OrderTypes["deliveryAdress"] | null | undefined) {
  if (!deliveryAddress) return [];

  return Object.entries(deliveryAddress).map(([key, value]) => ({
    key,
    label: getDeliveryAddressLabel(key),
    value: safeValue(value),
  }));
}
