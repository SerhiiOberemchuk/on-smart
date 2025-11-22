import FormFeedback from "@/components/FormFeedback/FormFeedback";
import { baseUrl } from "@/types/baseUrl";
import Script from "next/script";
import { Suspense } from "react";

export default function FeedbackFormSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Richiedi una consulenza",
    url: `${baseUrl}#contact-form`,
    mainEntity: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Italian", "English"],
      areaServed: "IT",
      description:
        "Modulo di contatto per richiedere informazioni, consulenze tecniche o collaborazioni con OnSmart.",
    },
  };
  return (
    <section className="py-8 lg:py-16">
      <div className="container">
        <div className="flex flex-col justify-between gap-8 rounded-sm bg-background p-3 lg:flex-row">
          <header className="max-w-[474px]">
            <h2 className="H2 mb-3">Richiedi una consulenza</h2>{" "}
            <p className="sr-only">
              Modulo ufficiale di contatto OnSmart per richieste di informazioni, consulenze
              personalizzate, collaborazioni aziendali o ordini B2B.
            </p>
            <p className="text_R">
              Hai una domanda su una collaborazione o desideri effettuare un ordine aziendale?
              <br />
              Contattami tramite questo modulo.
            </p>
          </header>
          <Suspense>
            <FormFeedback type="general-feedback" />
          </Suspense>
        </div>
      </div>
      <Script
        id="feedback-form-section-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
