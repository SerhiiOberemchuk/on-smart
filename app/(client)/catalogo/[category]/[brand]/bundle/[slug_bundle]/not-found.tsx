import type { Metadata } from "next";
import NotFoundPanel from "@/app/(client)/_components/NotFoundPanel";

export const metadata: Metadata = {
  title: "Bundle non trovato",
  description: "Il bundle richiesto non è disponibile su OnSmart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BundleNotFound() {
  return (
    <NotFoundPanel
      title="Bundle non trovato."
      description="Il bundle che stai cercando potrebbe essere stato rimosso, rinominato o non essere più disponibile nel nostro catalogo."
      imageAlt="Illustrazione bundle non trovato"
    />
  );
}
