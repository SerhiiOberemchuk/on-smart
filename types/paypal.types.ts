export type PayPalMoney = {
  currency_code: string;
  value: string;
};

export type PayPalCapture = {
  id: string;
  status: string;
  amount?: PayPalMoney;
};

export type PayPalPayments = {
  captures?: PayPalCapture[];
};

export type PayPalPurchaseUnit = {
  reference_id?: string;
  payments?: PayPalPayments;
};

export type PayPalPayer = {
  payer_id?: string;
  email_address?: string;
};

export type PayPalOrderCaptureResponse = {
  id: string;
  status: string;
  payer?: PayPalPayer;
  purchase_units?: PayPalPurchaseUnit[];
};
