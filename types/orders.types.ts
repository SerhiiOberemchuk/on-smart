import { createConstatObjFromEnumArray } from "@/utils/tupleToEnumObject";

export const ORDER_STATUS_LIST = [
  "PENDING_PAYMENT",
  "PAID",
  "FULFILLING",
  "SHIPPED",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELED",
  "REFUNDED",
] as const;
export type OrderStatusTypes = (typeof ORDER_STATUS_LIST)[number];
export const ORDER_STATUS_CONSTANS = createConstatObjFromEnumArray(ORDER_STATUS_LIST);

export const CLIENT_TYPE_LIST = ["privato", "azienda"] as const;
export type ClientType = (typeof CLIENT_TYPE_LIST)[number];
export const CLIENT_TYPE_CONSTANT = createConstatObjFromEnumArray(CLIENT_TYPE_LIST);

export const DELIVERY_METHOD_LIST = ["CONSEGNA_CORRIERE", "RITIRO_NEGOZIO"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHOD_LIST)[number];
export const DELIVERY_METHOD_CONSTANT = createConstatObjFromEnumArray(DELIVERY_METHOD_LIST);

export const CURRENCY_LIST = ["EUR"] as const;
export type CurrencyType = (typeof CURRENCY_LIST)[number];
export const CURRENCY_CONSTANT = createConstatObjFromEnumArray(CURRENCY_LIST);
