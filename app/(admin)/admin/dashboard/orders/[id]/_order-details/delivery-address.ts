import type { OrderTypes } from "@/db/schemas/orders.schema";
import { safeValue } from "./formatters";

export const DELIVERY_ADDRESS_LABELS: Record<string, string> = {
  cap: "Поштовий індекс",
  citta: "Місто",
  indirizzo: "Адреса",
  nazione: "Країна",
  partita_iva: "ПДВ (IVA)",
  provincia_regione: "Провінція / Регіон",
  ragione_sociale: "Назва компанії",
  referente_contatto: "Контактна особа",
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
