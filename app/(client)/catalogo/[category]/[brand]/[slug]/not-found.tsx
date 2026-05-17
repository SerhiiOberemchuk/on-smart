import type { Metadata } from "next";
import NotFoundPanel from "@/app/(client)/_components/NotFoundPanel";

export const metadata: Metadata = {
  title: "Prodotto non trovato",
  description: "Il prodotto richiesto non è disponibile su OnSmart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductNotFound() {
  return (
    <NotFoundPanel
      title="Prodotto non trovato."
      description="Il prodotto che stai cercando potrebbe essere stato rimosso, rinominato o non essere più disponibile nel nostro catalogo."
      imageAlt="Illustrazione prodotto non trovato"
    />
  );
}
