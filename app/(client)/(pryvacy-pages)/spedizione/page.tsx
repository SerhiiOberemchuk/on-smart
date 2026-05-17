import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { DELIVERY_DATA } from "@/types/delivery.data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spedizione e consegna",
  description:
    "Informazioni complete sulla spedizione: tempistiche, corrieri, costi, giacenza, verifiche alla consegna e procedure in caso di pacco danneggiato.",
  alternates: {
    canonical: `${CONTACTS_ADDRESS.BASE_URL}/spedizione`,
  },
};

export default function SpedizionePage() {
  return (
    <section className="container py-10 leading-relaxed text-text-grey">
      <h1 className="H2 mb-6 text-white">Spedizione e consegna</h1>

      <div className="text_R space-y-6">
        <p>
          Per rendere sicure, veloci e affidabili le nostre spedizioni, lavoriamo con SDA, GLS, UPS,
          BRT e altri corrieri espresso che consegnano in tutta Italia. Per la merce disponibile in
          stock presso il nostro magazzino, la consegna avviene mediamente in 24/48 ore
          dall'evasione dell'ordine; per alcune zone remote può richiedere fino a 72 ore. La
          consegna viene effettuata dal lunedì al venerdì.
        </p>

        <p>
          Per prodotti a lenta rotazione, ricambi, prodotti su ordinazione o articoli con
          configurazione tecnica, come i kit di videosorveglianza, fanno fede le tempistiche indicate
          nella scheda prodotto o comunicate dalla nostra assistenza. Gli ordini effettuati il
          sabato, la domenica o nei giorni festivi vengono gestiti il lunedì o il primo giorno
          lavorativo utile.
        </p>

        <p>
          Nel caso di pagamento tramite bonifico bancario, l'evasione dell'ordine avviene
          esclusivamente al momento dell'accredito del pagamento. Il numero di tracking viene
          comunicato via e-mail all'indirizzo inserito in fase di registrazione.
        </p>

        <p>
          Informazioni aggiuntive sullo stato dell'ordine possono essere richieste via e-mail a
          assistenza@on-smart.it.
        </p>

        <h2 className="H3 pt-4 text-white">Modalità di consegna</h2>
        <p>
          Il corriere effettua due tentativi di consegna all'indirizzo indicato dal cliente. Se la
          consegna non va a buon fine, la spedizione viene trattenuta in giacenza e il cliente viene
          contattato per concordare una nuova consegna o il ritiro presso il centro di smistamento
          del corriere. Eventuali costi di giacenza e riconsegna sono a carico del cliente.
        </p>

        <h2 className="H3 pt-4 text-white">Costi di spedizione</h2>
        <p>
          I costi di spedizione sono calcolati in base all'indirizzo di consegna, alle dimensioni e
          al peso della merce. Per l'Italia, il costo minimo di spedizione parte da{" "}
          {DELIVERY_DATA.PRISE_DELIVERY.toFixed(2)} euro IVA inclusa, salvo possibili variazioni.
        </p>

        <p>
          Per ordini superiori a {DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE.toFixed(2)} euro la
          spedizione è gratuita. Il servizio non comprende facchinaggio, consegna su appuntamento o
          spese di deposito per destinatario assente.
        </p>

        <h2 className="H3 pt-4 text-white">Come comportarsi al ricevimento del pacco</h2>
        <p>Al momento della consegna il cliente deve verificare:</p>

        <ul className="list-disc space-y-2 pl-6">
          <li>che il pacco sia integro, non danneggiato né bagnato;</li>
          <li>che il nastro adesivo sia integro e non manomesso;</li>
          <li>che il numero dei pacchi indicato sulla lettera di vettura corrisponda a quello ricevuto.</li>
        </ul>

        <p>
          Eventuali contestazioni devono essere segnalate immediatamente al vettore. In mancanza di
          contestazioni, il prodotto si considera consegnato correttamente.
        </p>

        <h3 className="H4 pt-4 text-white">In caso di pacco danneggiato o manomesso</h3>
        <p>Occorre:</p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>accettare con riserva:</strong> scrivere sulla ricevuta "Accetto con riserva"
            indicando l'anomalia riscontrata;
          </li>
          <li>
            <strong>rifiutare il pacco:</strong> in caso di evidente manomissione o apertura non
            autorizzata.
          </li>
        </ul>

        <p>
          Se il cliente non esegue queste verifiche, OnSmart considera il pacco regolarmente
          consegnato.
        </p>
      </div>

      <script
        id="shipping-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Spedizione e consegna",
            url: `${CONTACTS_ADDRESS.BASE_URL}/spedizione`,
            description:
              "Informazioni sulle spedizioni: corrieri, tempistiche, giacenza, costi, controllo pacco e procedure in caso di danni.",
          }),
        }}
      />

      <script
        id="shipping-breadcrumbs-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${CONTACTS_ADDRESS.BASE_URL}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Spedizione e consegna",
                item: `${CONTACTS_ADDRESS.BASE_URL}/spedizione`,
              },
            ],
          }),
        }}
      />
    </section>
  );
}
