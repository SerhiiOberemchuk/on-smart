import type { Metadata } from "next";
import NotFoundPanel from "@/app/(client)/_components/NotFoundPanel";

export const metadata: Metadata = {
  title: "Categoria non trovata",
  description: "La categoria richiesta non è disponibile su OnSmart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CategoryNotFound() {
  return (
    <NotFoundPanel
      title="Categoria non trovata."
      description="La categoria che stai cercando potrebbe essere stata rimossa, rinominata o non essere più disponibile nel nostro catalogo."
      imageAlt="Illustrazione categoria non trovata"
    />
  );
}
