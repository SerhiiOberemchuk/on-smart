import { createConstatObjFromEnumArray } from "@/utils/tupleToEnumObject";

export const WITHDRAWAL_STATUS_LIST = ["RECEIVED", "PROCESSING", "ACCEPTED", "REJECTED"] as const;
export type WithdrawalStatusType = (typeof WITHDRAWAL_STATUS_LIST)[number];
export const WITHDRAWAL_STATUS_CONSTANT = createConstatObjFromEnumArray(WITHDRAWAL_STATUS_LIST);

/** Admin UI labels (Ukrainian, per AGENTS.md language rules). */
export const WITHDRAWAL_STATUS_LABEL: Record<WithdrawalStatusType, string> = {
  RECEIVED: "Отримано",
  PROCESSING: "В обробці",
  ACCEPTED: "Прийнято",
  REJECTED: "Відхилено",
};

/** Storefront labels (Italian). */
export const WITHDRAWAL_STATUS_LABEL_IT: Record<WithdrawalStatusType, string> = {
  RECEIVED: "Ricevuta",
  PROCESSING: "In lavorazione",
  ACCEPTED: "Accettata",
  REJECTED: "Non accolta",
};

/** Storefront text colour per status (dark background). */
export const WITHDRAWAL_STATUS_TEXT_CLASS: Record<WithdrawalStatusType, string> = {
  RECEIVED: "text-yellow-500",
  PROCESSING: "text-blue-300",
  ACCEPTED: "text-green-300",
  REJECTED: "text-red-300",
};

export type WithdrawalFormState = {
  success: boolean;
  message: string | null;
  /** Set on success — ISO string of the registered submission time (art. 54-bis: data e ora). */
  submittedAt?: string;
};
