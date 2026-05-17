import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - Pagamento",
  description: "Scelta del metodo di pagamento per l'ordine OnSmart.",
};

export default function CheckoutPagamentoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
