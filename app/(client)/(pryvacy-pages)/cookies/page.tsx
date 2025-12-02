import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cookie Policy | On Smart – Utilizzo dei Cookie e Preferenze",
  description:
    "Cookie Policy di On Smart: informazioni sull’uso dei cookie tecnici, analitici, di terze parti e di profilazione. Scopri come gestire le preferenze e come trattiamo i dati di navigazione.",
  alternates: {
    canonical: `${CONTACTS_ADDRESS.BASE_URL}/cookies`,
  },
  openGraph: {
    title: "Cookie Policy | On Smart",
    description:
      "Informazioni dettagliate sull’uso dei cookie, tipologie utilizzate, durata, gestione delle preferenze e servizi di terze parti.",
    url: `${CONTACTS_ADDRESS.BASE_URL}/cookies`,
    siteName: "On Smart",
    locale: "it_IT",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function InformativaSullaPrivacy() {
  return (
    <section>
      <h1 className="H2 mb-6 text-white">Cookie Policy</h1>
      <ul className="flex flex-col gap-6 [&>li>h2]:mb-1 [&>li>p]:text-text-grey">
        <li>
          <h2>1. Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che i siti web visitati inviano al dispositivo
            dell`utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti in
            occasione di visite successive. Servono per migliorare l`esperienza di navigazione,
            memorizzare preferenze o raccogliere informazioni statistiche anonime.
          </p>
        </li>
        <li>
          <h2>2. Tipologie di cookie utilizzati</h2>
          <p>
            Il sito on-smart.it utilizza le seguenti tipologie di cookie: Cookie tecnici: necessari
            al corretto funzionamento del sito (ad esempio per il carrello, la gestione degli ordini
            o la lingua). Non richiedono il consenso dell`utente. Cookie analitici: utilizzati per
            raccogliere informazioni statistiche anonime sull`uso del sito tramite Google Analytics
            (numero di visitatori, pagine visitate, durata della visita, ecc.). Cookie di terze
            parti: provenienti da servizi esterni come PayPal, Google o social network, necessari
            per garantire funzionalità di pagamento o analisi. Cookie di profilazione: utilizzati
            per mostrare contenuti o offerte personalizzate. Vengono installati solo previo consenso
            esplicito.
          </p>
        </li>
        <li>
          <h2>3. Gestione dei cookie</h2>
          <p>
            Al primo accesso al sito, un banner informa l`utente sull`uso dei cookie e consente di:
            Accettare tutti i cookie; Rifiutare quelli non essenziali; Personalizzare le preferenze.
            Le preferenze possono essere modificate in qualsiasi momento tramite le impostazioni del
            browser o il link “Gestisci cookie”.{" "}
          </p>
        </li>
        <li>
          <h2>4. Cookie di terze parti utilizzati:</h2>
          <p>
            Google Analytics (Google LLC): servizio di analisi web che utilizza cookie per
            raccogliere dati anonimi sul traffico. <br /> Maggiori informazioni su
            policies.google.com/privacy. <br /> PayPal (PayPal Europe S.à r.l.): per la gestione dei
            pagamenti online. <br /> Informativa completa su paypal.com/privacy.
          </p>
        </li>
        <li>
          <h2> 5. Durata dei cookie</h2>
          <p>
            I cookie hanno una durata variabile: di sessione: vengono eliminati alla chiusura del
            browser; persistenti: restano memorizzati fino alla scadenza o cancellazione manuale da
            parte dell`utente.
          </p>
        </li>
        <li>
          <h2> 6. Come disabilitare i cookie </h2>
          <p>
            L`utente può gestire o disabilitare i cookie tramite le impostazioni del proprio
            browser: Google Chrome: support.google.com/chrome/answer/95647 Mozilla Firefox:
            support.mozilla.org Safari: support.apple.com Microsoft Edge: support.microsoft.com
          </p>
        </li>
        <li>
          <h2>7. Modifiche alla Cookie Policy</h2>
          <p>
            La presente Cookie Policy può essere aggiornata in qualsiasi momento. Le modifiche
            entreranno in vigore al momento della pubblicazione sul sito. Ultimo aggiornamento:
            01.01.2026.
          </p>
        </li>
      </ul>
      <Script
        id="json-ld-cookie-policy"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Cookie Policy",
            description:
              "Informazioni sull'uso dei cookie su on-smart.it: cookie tecnici, analitici, di terze parti e di profilazione. Dettagli sulla gestione delle preferenze e durata dei cookie.",
            url: `${CONTACTS_ADDRESS.BASE_URL}/cookie-policy`,
            publisher: {
              "@type": "Organization",
              name: "On Smart",
              url: `${CONTACTS_ADDRESS.BASE_URL}`,
              logo: {
                "@type": "ImageObject",
                url: `${CONTACTS_ADDRESS.BASE_URL}/logo.png`,
              },
            },
            mainEntity: [
              {
                "@type": "Question",
                name: "Cosa sono i cookie?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "I cookie sono piccoli file di testo che vengono memorizzati nel dispositivo dell’utente per migliorare la navigazione e fornire funzionalità avanzate.",
                },
              },
              {
                "@type": "Question",
                name: "Quali cookie utilizza on-smart.it?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Il sito utilizza cookie tecnici, analitici, di terze parti e cookie di profilazione attivi solo previo consenso.",
                },
              },
              {
                "@type": "Question",
                name: "Come posso gestire i cookie?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "È possibile accettare, rifiutare o personalizzare i cookie tramite il banner iniziale o le impostazioni del browser.",
                },
              },
              {
                "@type": "Question",
                name: "Quali servizi di terze parti utilizzano cookie?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Servizi come Google Analytics e PayPal possono impostare cookie per analisi e pagamenti.",
                },
              },
              {
                "@type": "Question",
                name: "Qual è la durata dei cookie?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Alcuni cookie durano solo fino alla chiusura del browser, mentre altri persistono per più tempo fino alla scadenza.",
                },
              },
            ],
          }),
        }}
      />
    </section>
  );
}
