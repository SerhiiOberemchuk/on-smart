import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - Informazioni cliente",
  description: "Inserimento dei dati cliente per completare l'ordine OnSmart.",
};

export default function CheckoutInformazioniLayout({ children }: { children: React.ReactNode }) {
  return children;
}
