import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Spedizione e Consegna | OnSmart",
  description:
    "Informazioni complete sulla spedizione: tempistiche, corrieri, costi, giacenza, verifiche alla consegna e procedure in caso di pacco danneggiato.",
  alternates: {
    canonical: "https://www.on-smart.it/spedizione",
  },
};

export default function SpedizionePage() {
  return (
    <section className="container py-10 leading-relaxed text-text-grey">
      <h1 className="H2 mb-6 text-white">Spedizione e Consegna</h1>

      <div className="text_R space-y-6">
        <p>
          Spedizione e consegna Per rendere sicure, veloci e affidabili le nostre spedizioni,
          lavoriamo con SDA, GLS, UPS, BRT e altri corrieri espresso che consegnano in tutta Italia.
          Per la merce subito presente in stock presso il nostro magazzino il corriere consegna
          mediamente in 24/48 ore dall`evasione dell`ordine (per alcune zone remote la consegna
          avviene in 72 ore). La consegna viene effettuata dal lunedì al venerdì.
        </p>

        <p>
          Per i prodotti a lenta rotazione quali ricambi, prodotti su ordinazione o prodotti con
          configurazione tecnica (per esempio, kit di videosorveglianza), fanno fede le tempistiche
          presenti sulla scheda prodotto o quelle comunicate dalla nostra assistenza commerciale
          post vendita. E` nostra premura comunicare sempre quali articoli hanno bisogno di una
          tempistica maggiore per essere consegnati. Gli ordini effettuati il sabato, la domenica o
          nei giorni festivi vengono gestiti il lunedì, o il primo giorno lavorativo utile.
        </p>

        <p>
          Nel caso di pagamento tramite bonifico bancario, l`evasione dell`ordine avviene
          esclusivamente al momento dell`accredito del pagamento (i tempi di consegna possono quindi
          subire dei ritardi). Sarà nostra cura comunicare al cliente il numero di tracking
          (monitoraggio) dell`ordine mediante apposito messaggio email all`indirizzo inserito in
          fase di registrazione.
        </p>

        <p>
          Informazioni aggiuntive sullo stato dell`ordine potranno essere richieste via email a
          assistenza@on-smart.it.
        </p>

        <h2 className="H3 pt-4">Modalità di consegna</h2>
        <p>
          Il corriere è un vettore che effettua due tentativi di consegna all`indirizzo indicato dal
          cliente in fase di compilazione del proprio ordine. Qualora il tentativo di consegna non
          avesse buon esito, il corriere tratterrà la spedizione in giacenza e il cliente verrà da
          noi contattato per stabile entro 10 giorni una nuova modalità di consegna o il ritiro
          presso il centro di smistamento del corriere. Eventuali costi di giacenza e riconsegna
          saranno a carico del cliente.
        </p>

        <h2 className="H3 pt-4">Costi di spedizione</h2>
        <p>
          L`ammontare dei costi di spedizione a carico del cliente per i servizi del corriere è
          calcolato in base all`indirizzo di spedizione indicato al momento dell`ordine, alle
          dimensioni e al peso della merce inviata. Per L`Italia, si parte da un costo minimo di
          spedizione di 6,00€ (iva esclusa - soggetto a possibili variazioni)
        </p>

        <p>
          Il nostro servizio spedizione non comprende servizi aggiuntivi di: Facchinaggio; Fonsegna
          su appuntamento; Spese di deposito per destinatario assente.
        </p>

        <h2 className="H3 pt-4">Come comportarsi al ricevimento del pacco</h2>
        <p>Quando il corriere effettuerà la consegna il cliente dovrà verificare:</p>

        <ul className="list-disc space-y-2 pl-6">
          <li>Che il pacco sia integro, non danneggiato né bagnato</li>
          <li>Che il nastro adesivo personalizzato sia integro e non manomesso</li>
          <li>
            Che il numero dei pacchi indicato sulla lettera di vettura corrisponda a quello ricevuto
          </li>
        </ul>

        <p>
          Eventuali contestazioni devono essere immediatamente sollevate al vettore, in mancanza di
          queste, il prodotto si considera consegnato correttamente.
        </p>

        <h3 className="H4 pt-4">In caso di pacco danneggiato o manomesso</h3>
        <p>Occorre:</p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Accettare con riserva:</strong> scrivere sulla ricevuta “Accetto con diritto di
            riserva perché il pacco presenta la seguente anomalia …”.
          </li>
          <li>
            <strong>Rifiutare il pacco:</strong> se evidente manomissione o apertura non
            autorizzata.
          </li>
        </ul>

        <p>
          Se il cliente non esegue queste operazioni ON-SMART ritiene il pacco regolarmente
          consegnato.
        </p>
      </div>

      <Script
        id="shipping-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Spedizione e Consegna",
            url: "https://www.on-smart.it/spedizione",
            description:
              "Informazioni sulle spedizioni: corrieri, tempistiche, giacenza, costi, controllo pacco e procedure in caso di danni.",
          }),
        }}
      />

      <Script
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
                item: "https://www.on-smart.it/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Spedizione e Consegna",
                item: "https://www.on-smart.it/spedizione",
              },
            ],
          }),
        }}
      />
    </section>
  );
}
