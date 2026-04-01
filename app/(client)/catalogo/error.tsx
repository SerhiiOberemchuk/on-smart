"use client";

import LinkYellow from "@/components/YellowLink";

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[catalogo/error.tsx]", error);

  return (
    <section className="bg-background py-8 lg:py-14">
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-sm border border-stroke-grey bg-black/20 px-5 py-8 text-center lg:px-10 lg:py-12">
          <span className="helper_text uppercase tracking-[0.24em] text-yellow-primary">
            Catalogo
          </span>
          <h1 className="H2 mt-4">Si è verificato un errore durante il caricamento.</h1>
          <p className="text_R mt-3 max-w-2xl text-text-grey">
            Il catalogo non è disponibile in questo momento. Riprova il caricamento oppure torna
            più tardi.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="button_yellow min-w-44">
              Riprova
            </button>
            <LinkYellow href="/" title="Torna alla home" className="min-w-44" />
          </div>
        </div>
      </div>
    </section>
  );
}
