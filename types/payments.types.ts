import { createConstatObjFromEnumArray } from "@/utils/tupleToEnumObject";

export const PAYMENT_PROVIDER_LIST = ["paypal", "sumup", "klarna"] as const;
export const PAYMENT_PROVIDER_CONSTANT = createConstatObjFromEnumArray(PAYMENT_PROVIDER_LIST);
export type PaymentProviderTypes = (typeof PAYMENT_PROVIDER_LIST)[number];

export const PAYMENT_STATUS_LIST = [
  "CREATED",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "CANCELED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;
export const PAYMENT_STATUS_CONSTANT = createConstatObjFromEnumArray(PAYMENT_STATUS_LIST);
export type PaymentStatusTypes = (typeof PAYMENT_STATUS_LIST)[number];
