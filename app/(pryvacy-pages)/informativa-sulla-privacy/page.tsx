import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Informativa sulla Privacy | OnSmart",
  description:
    "Scopri come OnSmart raccoglie, utilizza e protegge i dati personali conforme al GDPR.",
  alternates: {
    canonical: "https://www.on-smart.it/informativa-sulla-privacy",
  },
};

export default function InformativaSullaPrivacy() {
  return (
    <div>
      <h1 className="H2 mb-6 text-white">Informativa sulla Privacy</h1>
      <ol className="text_R flex flex-col gap-3 text-text-grey [&>li>h2]:mb-1 [&>li>h2]:text-white [&>li>p>strong]:text-white">
        <li>
          <h2> 1. Titolare del trattamento </h2>
          <p>
            Il Titolare del trattamento dei dati personali è: <br />
            <strong>ON-SMART di Olena Nudzhevska</strong> <br /> Partita IVA:{" "}
            <strong>03168860645</strong> <br />
            E-mail di contatto per la privacy: <strong>assistenza@on-smart.it</strong>
          </p>
        </li>
        <li>
          <h2> 2. Tipologie di dati raccolti </h2>
          <p>
            Il sito raccoglie e tratta le seguenti categorie di dati personali: Dati identificativi
            e di contatto: nome, cognome, indirizzo e-mail, numero di telefono, indirizzo di
            consegna. Dati fiscali: codice fiscale o Partita IVA, necessari per l`emissione delle
            fatture. Dati di pagamento: informazioni relative ai pagamenti effettuati tramite carta
            di credito, bonifico bancario o PayPal. I dati delle carte non sono trattati
            direttamente dal sito ma dai rispettivi provider di pagamento. Dati tecnici e di
            navigazione: indirizzo IP, tipo di browser, sistema operativo, cookie e altri
            identificatori online raccolti automaticamente attraverso Google Analytics e altri
            strumenti simili.
          </p>
        </li>
        <li>
          <h2> 3. Finalità del trattamento </h2>
          <p>
            I dati personali vengono trattati per le seguenti finalità: Gestione degli ordini,
            consegne e fatturazione; Risposta a richieste di informazioni inviate tramite modulo di
            contatto o e-mail; Adempimento degli obblighi legali e fiscali; Analisi statistica
            anonima del traffico del sito (Google Analytics); Sicurezza e miglioramento del sito
            web; Invio di comunicazioni promozionali o newsletter solo previo consenso esplicito
            dell`utente.
          </p>
        </li>
        <li>
          <h2> 4. Base giuridica del trattamento </h2>
          <p>
            Il trattamento dei dati si basa su: Esecuzione di un contratto o di misure
            precontrattuali richieste dall`interessato; Obbligo legale per finalità fiscali e
            contabili; Consenso esplicito per attività di marketing e comunicazioni commerciali;
            Legittimo interesse del Titolare per garantire la sicurezza del sito e prevenire frodi.
          </p>
        </li>
        <li>
          <h2> 5. Destinatari dei dati </h2>
          <p>
            I dati personali possono essere comunicati a: Fornitori di servizi tecnici (hosting,
            manutenzione, servizi IT); Corrieri e servizi di spedizione; Consulenti fiscali e
            contabili; Piattaforme di pagamento come PayPal, istituti bancari e altri intermediari;
            Servizi di analisi web come Google Analytics. Tutti i soggetti operano come Responsabili
            del trattamento conformemente all`art. 28 GDPR.
          </p>
        </li>
        <li>
          <h2> 6. Trasferimento dei dati fuori dall`UE </h2>
          <p>
            Alcuni fornitori di servizi (es. Google, PayPal) possono trasferire dati verso Paesi
            extra-UE. Tali trasferimenti avvengono in conformità agli articoli 44-49 del GDPR,
            garantendo un adeguato livello di protezione dei dati.
          </p>
        </li>
        <li>
          <h2> 7. Periodo di conservazione </h2>
          <p>
            I dati vengono conservati per il tempo necessario alle finalità per cui sono stati
            raccolti e comunque: Per finalità contrattuali e fiscali: 10 anni dalla cessazione del
            rapporto commerciale; Per finalità di marketing: fino alla revoca del consenso; Per
            finalità tecniche o di sicurezza: secondo i tempi di conservazione previsti dai cookie o
            dai log di sistema.
          </p>
        </li>
        <li>
          <h2> 8. Diritti dell`interessato </h2>
          <p>
            L`utente ha il diritto di: <br /> Accedere ai propri dati personali;
            <br /> Chiederne la rettifica o la cancellazione (“diritto all`oblio”); <br /> Limitare
            o opporsi al trattamento;
            <br /> Richiedere la portabilità dei dati; <br />
            Revocare il consenso in qualsiasi momento;
            <br /> Presentare reclamo al ≠ per la Protezione dei Dati Personali
            (www.garanteprivacy.it). <br />
            Le richieste possono essere inviate a assistenza@on-smart.it.
          </p>
        </li>
        <li>
          <h2> 9. Cookie </h2>
          <p>
            Il sito utilizza cookie tecnici e, previo consenso, cookie analitici e di profilazione
            (ad esempio Google Analytics). Per maggiori informazioni consultare la Cookie Policy
            dedicata.
          </p>
        </li>
        <li>
          <h2> 10. Sicurezza dei dati </h2>
          <p>
            I dati sono trattati con strumenti informatici e telematici adottando misure di
            sicurezza adeguate per prevenirne perdita, accessi non autorizzati o uso illecito
            (protocollo HTTPS, backup, accesso limitato ai dati).
          </p>
        </li>
        <li>
          <h2> 11. Modifiche alla presente informativa </h2>
          <p>
            Il Titolare si riserva il diritto di modificare in qualsiasi momento la presente
            informativa. Le modifiche saranno pubblicate su questa pagina con indicazione della data
            di aggiornamento. Ultimo aggiornamento: [aggiungi data di pubblicazione].
          </p>
        </li>
      </ol>
      <Script
        id="garanzia-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Garanzia e Diritto di Recesso",
            url: "https://on-smart.it/garanzia",
            description:
              "Informazioni complete sulla garanzia legale, sui prodotti ricondizionati, limitazioni, diritto di recesso e procedure di reso per i prodotti acquistati su OnSmart.",
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://on-smart.it/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Garanzia",
                  item: "https://on-smart.it/garanzia",
                },
              ],
            },
          }),
        }}
      />

      <Script
        id="garanzia-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Qual è la durata della garanzia per i consumatori privati?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Per i consumatori privati, la garanzia legale è di 24 mesi dalla data di consegna del prodotto.",
                },
              },
              {
                "@type": "Question",
                name: "Qual è la durata della garanzia con fattura e partita IVA?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Per gli acquisti con fattura intestata a partita IVA, la garanzia è di 12 mesi.",
                },
              },
              {
                "@type": "Question",
                name: "È possibile richiedere una fattura e mantenere la garanzia di 24 mesi?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sì. Se la fattura è intestata a una persona senza partita IVA, la garanzia rimane di 24 mesi.",
                },
              },
              {
                "@type": "Question",
                name: "Qual è la garanzia sui prodotti ricondizionati?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "I prodotti ricondizionati venduti da On Smart hanno una garanzia di 12 mesi.",
                },
              },
              {
                "@type": "Question",
                name: "Cosa non è coperto dalla garanzia?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "La garanzia non copre danni estetici, utilizzo improprio, installazione errata, manomissioni, danni elettrici o accidentali, e componenti soggetti a normale usura.",
                },
              },
              {
                "@type": "Question",
                name: "Come funziona il diritto di recesso?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Il consumatore privato può esercitare il diritto di recesso entro 14 giorni dal ricevimento del prodotto, senza penalità e senza dover fornire una motivazione.",
                },
              },
              {
                "@type": "Question",
                name: "Quali sono le condizioni per esercitare il recesso?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Il prodotto deve essere integro, non utilizzato, restituito nella confezione originale con tutti gli accessori e documentazione.",
                },
              },
              {
                "@type": "Question",
                name: "Entro quanto tempo avviene il rimborso?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Il rimborso viene effettuato entro 14 giorni dal ricevimento del prodotto reso.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
