import type { Metadata } from "next";
import NotFoundPanel from "@/app/(client)/_components/NotFoundPanel";

export const metadata: Metadata = {
  title: "Brand non trovato",
  description: "Il brand richiesto non è disponibile su OnSmart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BrandNotFound() {
  return (
    <NotFoundPanel
      title="Brand non trovato."
      description="Il brand che stai cercando potrebbe essere stato rimosso, rinominato o non essere più disponibile nel nostro catalogo."
      imageAlt="Illustrazione brand non trovato"
    />
  );
}
