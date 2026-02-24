export {};

declare global {
  type SumUpCardResponseType = "success" | "error" | "pending";

  type SumUpCardResponseBody = {
    status?: "PAID" | "FAILED" | "PENDING";
    checkout_id?: string;
    transaction_id?: string;
    error_code?: string;
    message?: string;
  };

  type SumUpCardMountConfig = {
    id: string;
    checkoutId: string;
    onResponse: (type: SumUpCardResponseType, body: SumUpCardResponseBody) => void;
  };

  interface Window {
    SumUpCard?: {
      mount: (config: SumUpCardMountConfig) => void;
    };
  }
}
