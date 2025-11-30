import LinkYellow from "@/components/YellowLink";
import Image from "next/image";

export default function ProductNotFound() {
  return (
    <div className="container flex items-center justify-center py-10">
      <div className="mx-auto flex max-w-[600px] flex-col">
        <div className="mx-auto flex items-center text-9xl lg:text-[300px]">
          4
          <Image
            src="/404.png"
            alt="Product Not Found"
            className="w-20 lg:w-44"
            width={176}
            height={176}
          />
          4
        </div>

        <h1 className="H2 mt-8 text-center xl:mt-16">Brand non trovato.</h1>

        <p className="text_R mt-3 text-center">
          Il brand che stai cercando potrebbe essere stato rimosso, rinominato o non è più
          disponibile nel nostro catalogo.
        </p>

        <LinkYellow href="/catalogo" className="mx-auto mt-3 xl:mt-8" title="Torna al catalogo" />
      </div>
    </div>
  );
}
