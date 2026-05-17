import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - Consegna",
  description: "Scelta della modalità di consegna per l'ordine OnSmart.",
};

export default function CheckoutConsegnaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
