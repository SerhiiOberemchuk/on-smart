import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";

export const bonificoData: { title: string; value: string }[] = [
  { title: "Intestatario conto", value: CONTACTS_ADDRESS.BANC_DETAILS.INTESTARIO },
  { title: "IBAN", value: CONTACTS_ADDRESS.BANC_DETAILS.IBAN },
  { title: "BIC/SWIFT", value: CONTACTS_ADDRESS.BANC_DETAILS.BIC },
  { title: "Banca", value: CONTACTS_ADDRESS.BANC_DETAILS.BANK_NAME },
  {
    title: "Causale",
    value: "Ordine OnSmart - indicare il numero d’ordine nella causale del bonifico.",
  },
];

export type MetodsPayment = {
  title: string;
  paymentMethod: "card" | "paypal" | "bonifico" | "klarna";
};

export const PAYMENT_METHODS: MetodsPayment[] = [
  {
    title: "Pagamento con carta",
    paymentMethod: "card",
  },
  {
    title: "PayPal",
    paymentMethod: "paypal",
  },
  {
    title: "Klarna",
    paymentMethod: "klarna",
  },
  {
    title: "Bonifico bancario",
    paymentMethod: "bonifico",
  },
];
