import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - Riepilogo ordine",
  description: "Riepilogo dei dati dell'ordine prima della conferma su OnSmart.",
};

export default function CheckoutRiepilogoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
