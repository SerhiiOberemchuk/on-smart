export {};

type KlarnaPaymentMethodCategory =
  | "pay_now"
  | "pay_later"
  | "pay_over_time"
  | "direct_debit"
  | "card"
  | string;

export interface KlarnaPaymentsInitOptions {
  client_token: string;
}

export interface KlarnaPaymentsLoadOptions {
  container: `#${string}`;
  payment_method_category: KlarnaPaymentMethodCategory;
}

export interface KlarnaPaymentsLoadResponse {
  show_form?: boolean;
}

export interface KlarnaPaymentsAuthorizeOptions {
  payment_method_category: KlarnaPaymentMethodCategory;
}

export interface KlarnaPaymentsAuthorizeResponse {
  approved: boolean;
  authorization_token?: string;
  show_form?: boolean;
}

export interface KlarnaPayments {
  init(options: KlarnaPaymentsInitOptions): void;

  load(
    options: KlarnaPaymentsLoadOptions,
    callback: (res: KlarnaPaymentsLoadResponse) => void,
  ): void;

  authorize(
    options: KlarnaPaymentsAuthorizeOptions,
    data: Record<string, unknown>,
    callback: (res: KlarnaPaymentsAuthorizeResponse) => void,
  ): void;
}

export interface KlarnaGlobal {
  Payments: KlarnaPayments;
}

declare global {
  interface Window {
    Klarna?: KlarnaGlobal;
  }
}
