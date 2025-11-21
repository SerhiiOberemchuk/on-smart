export const bonificoData: { title: string; value: string }[] = [
  { title: "Intestatario conto", value: "OnSmart S.r.l.s." },
  { title: "IBAN", value: "IT60X0542811010000000123456" },
  { title: "BIC/SWIFT", value: "BPPIITRRXXX" },
  { title: "Banca", value: "Banca Popolare di Puglia e Basilicata" },
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
    title: "Bonifico bancario online",
    paymentMethod: "bonifico",
  },
];
