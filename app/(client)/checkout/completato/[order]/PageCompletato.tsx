import SmartImage from "@/components/SmartImage";
import icon_success from "@/assets/icons/icon_success.svg";
import type { OrderTypes, OrderPaymentTypes } from "@/db/schemas/orders.schema";
import CompletionCleanup from "./CompletionCleanup";

type OrderResponse = {
  success: boolean;
  order: OrderTypes | null;
  error?: unknown;
};

type PaymentResponse = {
  success: boolean;
  paymentInfo: OrderPaymentTypes | null;
  error?: unknown;
};

export default function CompletatoPage({
  order,
  paymentInfo,
}: {
  order: OrderResponse;
  paymentInfo: PaymentResponse;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-sm bg-background p-4">
      <CompletionCleanup />

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-2">
          <SmartImage src={icon_success} alt="success icon" />
          <h1 className="H3 text-green">Ordine Completato</h1>
        </div>

        <p className="btn_small flex flex-wrap">
          <span>Numero ordine:</span>{" "}
          <span className="body_R_20">{order.order?.orderNumber ?? "-"}</span>
        </p>
        <p className="btn_small">
          Data dell`ordine:{" "}
          <span className="body_R_20">{order.order?.createdAt?.toLocaleDateString() ?? "-"}</span>
        </p>

        {order.order?.deliveryMethod === "CONSEGNA_CORRIERE" && (
          <>
            <p className="btn_small">
              Totale: <span className="body_R_20">{paymentInfo.paymentInfo?.amount ?? "-"} € </span>
            </p>
            <p className="btn_small">
              Consegna:{" "}
              <span className="body_R_20">{order.order.deliveryPrice.toFixed(2)} € </span>
            </p>
          </>
        )}
        {order.order?.deliveryMethod === "RITIRO_NEGOZIO" && (
          <>
            <p className="btn_small">
              Totale:{" "}
              <span className="body_R_20">{Number(paymentInfo.paymentInfo?.amount ?? 0).toFixed(2)} €</span>
            </p>
            <p className="btn_small">Ritiro presso il negozio</p>
          </>
        )}
        <p className="helper_text mt-2 w-full text-left text-text-grey">
          L`ordine è stato correttamente inviato. Riceverai una mail di conferma con i dettagli
          dell`ordine e la fattura. Per qualsiasi domanda o assistenza, non esitare a contattarci.
        </p>
      </div>

      {order.order ? (
        <div>
          <div className="flex items-center gap-2">
            <h3 className="H5">I tuoi dati</h3>
          </div>
          <div className="text_R mt-3 pl-8 text-text-grey">
            <p>{order.order.numeroTelefono}</p>
            <p>{order.order.email}</p>
            <p>{order.order.nome}</p>
            <p>{order.order.cognome}</p>
            <p>{order.order.cap}</p>
            <p>
              {order.order.indirizzo} {order.order.numeroCivico}
            </p>
            <p>
              {order.order.citta}, {order.order.provinciaRegione}
            </p>
            <p>{order.order.nazione}</p>
            {order.order.requestInvoice ? <p>Codice fiscale: {order.order.codiceFiscale}</p> : null}
            {order.order.clientType === "azienda" ? (
              <>
                <p>Referente: {order.order.referenteContatto}</p>
                <p>PEC: {order.order.pecAzzienda}</p>
                <p>Partita IVA: {order.order.partitaIva}</p>
                <p>Codice UNICO: {order.order.codiceUnico}</p>
                <p>Ragione sociale: {order.order.ragioneSociale}</p>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {order.order ? (
        <div>
          <div className="flex items-center gap-2">
            <h3 className="H5">Metodo di consegna</h3>
          </div>

          <div className="text_R mt-3 pl-8 text-text-grey">
            {order.order.deliveryMethod === "CONSEGNA_CORRIERE" ? <p>Corriere</p> : null}
            {order.order.deliveryMethod === "RITIRO_NEGOZIO" ? <p>Ritiro presso il magazzino di Avellino</p> : null}
            {order.order.deliveryMethod === "CONSEGNA_CORRIERE" ? (
              order.order.clientType === "azienda" ? (
                order.order.sameAsBilling ? (
                  <>
                    <p>{order.order.numeroTelefono}</p>
                    <p>{order.order.email}</p>
                    <p>{order.order.nome}</p>
                    <p>{order.order.cognome}</p>
                    <p>{order.order.referenteContatto}</p>
                    <p>{order.order.cap}</p>
                    <p>
                      {order.order.indirizzo}, {order.order.numeroCivico}
                    </p>
                    <p>
                      {order.order.citta}, {order.order.provinciaRegione}
                    </p>
                  </>
                ) : (
                  <>
                    <p>{order.order.numeroTelefono}</p>
                    <p>{order.order.email}</p>
                    <p>{order.order.deliveryAdress?.referente_contatto}</p>
                    <p>{order.order.deliveryAdress?.cap}</p>
                    <p>{order.order.deliveryAdress?.indirizzo}</p>
                    <p>
                      {order.order.deliveryAdress?.citta}, {order.order.deliveryAdress?.provincia_regione}
                    </p>
                  </>
                )
              ) : null
            ) : null}
          </div>
        </div>
      ) : null}

      <div>
        <div className="flex items-center gap-2">
          <h3 className="H5">Metodo di pagamento</h3>
        </div>

        <div className="text_R mt-3 pl-8 text-text-grey">
          {paymentInfo.paymentInfo?.provider === "bonifico" ? (
            <p>Bonifico bancario</p>
          ) : null}
          {paymentInfo.paymentInfo?.provider === "sumup" ? (
            <p>Pagamento effettuato con carta tramite SumUp.</p>
          ) : null}
          {paymentInfo.paymentInfo?.provider === "paypal" ? (
            <p>Pagamento completato in modo sicuro tramite PayPal.</p>
          ) : null}
          {paymentInfo.paymentInfo?.provider === "klarna" ? <p>Pagamento gestito tramite Klarna.</p> : null}
        </div>
      </div>
    </section>
  );
}
