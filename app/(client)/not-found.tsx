import type { Metadata } from "next";
import NotFoundPanel from "@/app/(client)/_components/NotFoundPanel";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  description: "La pagina richiesta non è disponibile su OnSmart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <NotFoundPanel
      title="Oops! Pagina non trovata."
      description="La pagina che stai cercando potrebbe essere stata spostata o non esistere più. Torna alla home per continuare a navigare tra i nostri prodotti."
      imageAlt="Illustrazione pagina non trovata"
      actionHref="/"
      actionTitle="Torna alla home"
    />
  );
}
