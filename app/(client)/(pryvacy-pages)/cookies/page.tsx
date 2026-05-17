import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Utilizzo dei cookie e preferenze",
  description:
    "Cookie Policy di OnSmart: informazioni sull'uso dei cookie tecnici, analitici, di terze parti e di profilazione. Scopri come gestire le preferenze e come trattiamo i dati di navigazione.",
  alternates: {
    canonical: `${CONTACTS_ADDRESS.BASE_URL}/cookies`,
  },
  openGraph: {
    title: "Cookie Policy",
    description:
      "Informazioni dettagliate sull'uso dei cookie, tipologie utilizzate, durata, gestione delle preferenze e servizi di terze parti.",
    url: `${CONTACTS_ADDRESS.BASE_URL}/cookies`,
    siteName: "OnSmart",
    locale: "it_IT",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiePolicy() {
  return (
    <section>
      <h1 className="H2 mb-6 text-white">Cookie Policy</h1>
      <ul className="flex flex-col gap-6 [&>li>h2]:mb-1 [&>li>p]:text-text-grey">
        <li>
          <h2>1. Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che i siti web visitati inviano al dispositivo
            dell'utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti in
            occasione di visite successive. Servono per migliorare l'esperienza di navigazione,
            memorizzare preferenze o raccogliere informazioni statistiche anonime.
          </p>
        </li>
        <li>
          <h2>2. Tipologie di cookie utilizzati</h2>
          <p>
            Il sito on-smart.it utilizza cookie tecnici necessari al corretto funzionamento del sito,
            cookie analitici per raccogliere statistiche anonime sull'uso del sito, cookie di terze
            parti collegati a servizi esterni come pagamenti e analytics, e cookie di profilazione
            installati solo previo consenso esplicito.
          </p>
        </li>
        <li>
          <h2>3. Gestione dei cookie</h2>
          <p>
            Al primo accesso al sito, un banner informa l'utente sull'uso dei cookie e consente di
            accettare tutti i cookie, rifiutare quelli non essenziali o personalizzare le
            preferenze. Le preferenze possono essere modificate in qualsiasi momento tramite le
            impostazioni del browser o il link "Gestisci cookie".
          </p>
        </li>
        <li>
          <h2>4. Cookie di terze parti utilizzati</h2>
          <p>
            Google Analytics può utilizzare cookie per raccogliere dati anonimi sul traffico.
            PayPal e altri provider di pagamento possono impostare cookie necessari alla gestione
            dei pagamenti online. Le rispettive informative sono disponibili sui siti dei singoli
            fornitori.
          </p>
        </li>
        <li>
          <h2>5. Durata dei cookie</h2>
          <p>
            I cookie hanno una durata variabile: alcuni vengono eliminati alla chiusura del browser,
            mentre altri restano memorizzati fino alla scadenza prevista o alla cancellazione
            manuale da parte dell'utente.
          </p>
        </li>
        <li>
          <h2>6. Come disabilitare i cookie</h2>
          <p>
            L'utente può gestire o disabilitare i cookie tramite le impostazioni del proprio
            browser. Le istruzioni sono disponibili nelle guide ufficiali di Google Chrome, Mozilla
            Firefox, Safari e Microsoft Edge.
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
      <script
        id="json-ld-cookie-policy"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Cookie Policy",
            description:
              "Informazioni sull'uso dei cookie su on-smart.it: cookie tecnici, analitici, di terze parti e di profilazione. Dettagli sulla gestione delle preferenze e sulla durata dei cookie.",
            url: `${CONTACTS_ADDRESS.BASE_URL}/cookies`,
            publisher: {
              "@type": "Organization",
              name: "OnSmart",
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
                  text: "I cookie sono piccoli file di testo memorizzati nel dispositivo dell'utente per migliorare la navigazione e fornire funzionalità avanzate.",
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
                name: "Qual è la durata dei cookie?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Alcuni cookie durano solo fino alla chiusura del browser, mentre altri persistono fino alla scadenza prevista.",
                },
              },
            ],
          }),
        }}
      />
    </section>
  );
}
