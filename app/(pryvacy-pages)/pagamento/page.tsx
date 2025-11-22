import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modalità di Pagamento | OnSmart",
  description:
    "Scopri tutte le modalità di pagamento disponibili su OnSmart: carta di credito SumUp, bonifico bancario, PayPal, PayPal in 3 rate, Klarna e sistemi sicuri certificati.",
  alternates: {
    canonical: "https://www.on-smart.it/pagamento",
  },
};

export default function PagamentoPage() {
  return (
    <div className="container py-10 leading-relaxed text-text-grey">
      <h1 className="H2 mb-6 text-white">Modalità di Pagamento</h1>

      <section className="text_R space-y-8">
        <p>
          Modalità di pagamento disponibili On Smart mette a disposizione diverse modalità di
          pagamento sicure e certificate, progettate per garantire affidabilità, chiarezza e
          trasparenza in ogni transazione. Tutti i pagamenti vengono elaborati tramite connessioni
          protette e sistemi conformi agli standard internazionali di sicurezza.
        </p>

        <h2 className="H3 mt-6">Carta di credito (SumUp)</h2>
        <p>
          Il pagamento può essere effettuato con le principali carte di credito e debito (Visa,
          Mastercard, Maestro, American Express) tramite la piattaforma SumUp. L`addebito viene
          eseguito al momento della conferma dell`ordine. I dati della carta non vengono memorizzati
          da On Smart e sono trattati esclusivamente dal sistema di pagamento certificato, nel
          rispetto degli standard PCI DSS.
        </p>

        <h2 className="H3 mt-6">Bonifico bancario anticipato</h2>
        <p>
          È prevista la possibilità di effettuare il pagamento tramite bonifico bancario. L
          `elaborazione dell`ordine avviene esclusivamente dopo la verifica dell`accredito dell
          `importo sul conto. La ricevuta del pagamento deve essere inviata via e-mail all`indirizzo
          assistenza@on-smart.it per consentire la registrazione e la spedizione del materiale
          ordinato.
        </p>
        <p>
          📌 Il bonifico deve riportare nella causale il numero d`ordine o il nome dell`acquirente.
        </p>

        <div className="rounded-sm bg-background p-4">
          <h3 className="mb-1 font-semibold">Dati per il bonifico</h3>
          <p>Intestatario: Olena Nudzhevska</p>
          <p>IBAN: IT49C0326815100052125108060</p>
          <p>BIC: SELBIT2BXXX</p>
          <p>Banca: Banca Sella S.p.A.</p>
          <p>Causale: Numero ordine o nome dell`acquirente</p>
        </div>

        <h2 className="H3 mt-6">PayPal</h2>
        <p>
          È disponibile il pagamento tramite conto PayPal, che consente transazioni rapide e sicure
          senza la necessità di condividere i dati bancari. L`addebito dell`importo avviene al
          momento della conferma dell`ordine. PayPal garantisce la protezione dell`acquirente
          secondo le proprie condizioni di utilizzo.
        </p>

        <h2 className="H3 mt-6">PayPal – Pagamento in 3 rate</h2>
        <p>
          Il servizio PayPal “Paga in 3 rate” consente di suddividere l`importo totale dell`acquisto
          in tre rate mensili senza interessi. L`opzione è disponibile durante il checkout ed è
          soggetta all`approvazione PayPal.
        </p>

        <h2 className="H3 mt-6">Klarna - Pagamento a rate</h2>
        <p>
          Klarna permette di pagare subito, posticipare il pagamento o suddividere l`importo in tre
          rate senza interessi. L`approvazione e la gestione del pagamento avvengono direttamente su
          Klarna.
        </p>

        <h2 className="H3 mt-6">Sicurezza dei pagamenti</h2>
        <p>
          Tutte le transazioni su www.on-smart.it sono protette da certificato SSL e protocolli di
          crittografia avanzata. I sistemi di pagamento utilizzati sono conformi agli standard di
          sicurezza PCI DSS. Nessun dato sensibile relativo ai pagamenti viene archiviato o
          condiviso con terzi non autorizzati.
        </p>

        <h2 className="H3 mt-6">Fatturazione</h2>
        <p>
          La richiesta di fattura può essere effettuata durante la procedura di acquisto. In
          alternativa, può essere richiesta entro 10 giorni inviando e-mail a
          assistenza@on-smart.it.
        </p>

        <h2 className="H3 mt-6">Tempi di elaborazione</h2>
        <ul className="list-disc pl-6">
          <li>Carte, PayPal e Klarna: elaborazione immediata</li>
          <li>Bonifico bancario: 1–2 giorni lavorativi dopo accredito</li>
        </ul>
      </section>

      <Script
        id="payment-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Modalità di Pagamento",
            url: "https://www.on-smart.it/pagamento",
            description:
              "Informazioni dettagliate sulle modalità di pagamento accettate da OnSmart: carta, bonifico, PayPal, PayPal in 3 rate, Klarna e sistemi sicuri.",
          }),
        }}
      />

      <Script
        id="payment-breadcrumbs-jsonld"
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
                name: "Pagamenti",
                item: "https://www.on-smart.it/pagamento",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
