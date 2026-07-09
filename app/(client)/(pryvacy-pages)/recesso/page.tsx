import { CONTACTS_ADDRESS } from "@/contacts-adress/contacts";
import { Metadata } from "next";
import Link from "next/link";
import GuestRecessoFallback from "./GuestRecessoFallback";

export const metadata: Metadata = {
  title: "Diritto di recesso — recedere dal contratto qui",
  description:
    "Esercita online il tuo diritto di recesso entro 14 giorni dalla consegna (art. 54-bis Codice del Consumo): accedi al tuo account, seleziona l'ordine e conferma il recesso.",
  alternates: {
    canonical: `${CONTACTS_ADDRESS.BASE_URL}/recesso`,
  },
};

// Entry point of the "funzione di recesso" (art. 54-bis Codice del Consumo,
// D.Lgs. 209/2025): describes the process and routes account customers to the
// in-account function; a guest fallback form covers pre-account-era orders.
export default function RecessoPage() {
  return (
    <div className="flex flex-col gap-6 text-text-grey">
      <h1 className="H2 text-white">Diritto di recesso</h1>

      <p>
        Se hai acquistato su On-Smart come consumatore (persona fisica che agisce per scopi
        estranei alla propria attività professionale), hai diritto di recedere dal contratto{" "}
        <strong>entro 14 giorni</strong> dal giorno in cui tu — o un terzo da te designato, diverso
        dal corriere — hai ricevuto il prodotto, senza indicarne il motivo (artt. 52 e seguenti del
        Codice del Consumo, D.Lgs. 206/2005).
      </p>

      <h2 className="H5 text-white">Come esercitare il recesso online (art. 54-bis)</h2>
      <ol className="flex list-decimal flex-col gap-2 pl-5">
        <li>
          Accedi al tuo account e apri la sezione{" "}
          <strong>Il mio account → Diritto di recesso</strong> (oppure la pagina del singolo
          ordine).
        </li>
        <li>
          Seleziona l&apos;ordine dal quale intendi recedere: nome, email e dati dell&apos;ordine
          sono già precompilati.
        </li>
        <li>
          Premi <strong>«Conferma recesso»</strong>: la dichiarazione viene trasmessa e ricevi
          subito, senza ritardo, una email di conferma con il contenuto della richiesta e la data e
          l&apos;ora di trasmissione.
        </li>
      </ol>

      <Link
        href="/account/recesso"
        className="self-start rounded-sm bg-yellow-500 px-5 py-3 font-medium text-black transition hover:bg-yellow-400"
      >
        Recedere dal contratto qui
      </Link>

      <h2 className="H5 mt-2 text-white">Cosa succede dopo</h2>
      <ul className="flex list-disc flex-col gap-2 pl-5">
        <li>
          Riceverai via email le istruzioni per la restituzione: il prodotto va rispedito entro 14
          giorni dalla comunicazione del recesso. I costi diretti di restituzione sono a tuo
          carico.
        </li>
        <li>
          Il rimborso di tutti i pagamenti ricevuti, comprese le spese di consegna standard,
          avviene entro 14 giorni da quando ci hai comunicato il recesso, con lo stesso mezzo di
          pagamento dell&apos;ordine. Possiamo trattenere il rimborso finché non abbiamo ricevuto
          il prodotto o la prova della sua spedizione.
        </li>
        <li>
          Il prodotto deve essere integro: sei responsabile solo della diminuzione di valore
          derivante da una manipolazione diversa da quella necessaria per stabilirne natura,
          caratteristiche e funzionamento.
        </li>
      </ul>

      <p className="helper_text">
        Il diritto di recesso non si applica nei casi previsti dall&apos;art. 59 del Codice del
        Consumo (ad es. beni personalizzati, beni sigillati aperti dopo la consegna non idonei alla
        restituzione per motivi igienici, software sigillati aperti). In alternativa alla funzione
        online puoi sempre inviare una dichiarazione esplicita di recesso a{" "}
        <a href="mailto:assistenza@on-smart.it" className="text-yellow-500 underline">
          assistenza@on-smart.it
        </a>
        . Maggiori informazioni su resi e garanzia:{" "}
        <a href="/garanzia" className="text-yellow-500 underline">
          Garanzia
        </a>
        .
      </p>

      <GuestRecessoFallback />
    </div>
  );
}
