import type { Metadata } from "next";
import LinkYellow from "@/components/YellowLink";
import SmartImage from "@/components/SmartImage";

export const metadata: Metadata = {
  title: "Brand non trovato | OnSmart",
  description: "Il brand richiesto non è disponibile su OnSmart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductNotFound() {
  return (
    <div className="container flex items-center justify-center py-10">
      <div className="mx-auto flex max-w-[600px] flex-col">
        <div className="mx-auto flex items-center text-9xl lg:text-[300px]">
          4
          <SmartImage
            src="/404.png"
            alt="Illustrazione brand non trovato"
            className="w-20 lg:w-44"
            width={176}
            height={176}
          />
          4
        </div>

        <h1 className="H2 mt-8 text-center xl:mt-16">Brand non trovato.</h1>

        <p className="text_R mt-3 text-center">
          Il brand che stai cercando potrebbe essere stato rimosso, rinominato o non più
          disponibile nel nostro catalogo.
        </p>

        <LinkYellow href="/catalogo" className="mx-auto mt-3 xl:mt-8" title="Torna al catalogo" />
      </div>
    </div>
  );
}
