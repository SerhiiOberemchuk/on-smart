import type { OrderTypes } from "@/db/schemas/orders.schema";
import { safeValue } from "./formatters";

type OrderCustomerCardProps = {
  order: OrderTypes;
  clientDisplayName: string;
  billingLine: string;
  billingCityLine: string;
  requestInvoice: boolean;
};

export function OrderCustomerCard({
  order,
  clientDisplayName,
  billingLine,
  billingCityLine,
  requestInvoice,
}: OrderCustomerCardProps) {
  const isCompany = order.clientType === "azienda";
  const delivery = order.deliveryAdress;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 font-semibold">Cliente</div>

      <div className="space-y-4 text-sm">
        <div>
          <div className="text-xs text-neutral-400">Tipo cliente</div>
          <div className="font-medium">{safeValue(order.clientType)}</div>
        </div>

        <div className="border-t border-neutral-800 pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
            Dati principali
          </div>
          <div>
            <div className="text-xs text-neutral-400">Nome completo / Azienda</div>
            <div className="font-medium">{safeValue(clientDisplayName)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Email</div>
            <div className="font-medium break-all">{safeValue(order.email)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Telefono</div>
            <div className="font-medium">{safeValue(order.numeroTelefono)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Referente contatto</div>
            <div className="font-medium">{safeValue(order.referenteContatto)}</div>
          </div>
        </div>

        {isCompany ? (
          <div className="border-t border-neutral-800 pt-4">
            <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
              Dati aziendali
            </div>
            <div>
              <div className="text-xs text-neutral-400">Ragione sociale</div>
              <div className="font-medium">{safeValue(order.ragioneSociale)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">Partita IVA</div>
              <div className="font-medium">{safeValue(order.partitaIva)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">PEC</div>
              <div className="font-medium break-all">{safeValue(order.pecAzzienda)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">Codice univoco</div>
              <div className="font-medium">{safeValue(order.codiceUnico)}</div>
            </div>
          </div>
        ) : (
          <div className="border-t border-neutral-800 pt-4">
            <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
              Dati persona privata
            </div>
            <div>
              <div className="text-xs text-neutral-400">Nome</div>
              <div className="font-medium">{safeValue(order.nome)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">Cognome</div>
              <div className="font-medium">{safeValue(order.cognome)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">Codice fiscale</div>
              <div className="font-medium">{safeValue(order.codiceFiscale)}</div>
            </div>
          </div>
        )}

        <div className="border-t border-neutral-800 pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
            Indirizzo fatturazione
          </div>
          <div>
            <div className="text-xs text-neutral-400">Via</div>
            <div className="font-medium">{safeValue(billingLine)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">CAP / Citta / Provincia</div>
            <div className="font-medium">{safeValue(billingCityLine)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Nazione</div>
            <div className="font-medium">{safeValue(order.nazione)}</div>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
            Fatturazione
          </div>
          <div>
            <div className="text-xs text-neutral-400">Richiesta fattura</div>
            <div className="font-medium">{requestInvoice ? "Si" : "No"}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Indirizzo spedizione uguale alla fatturazione</div>
            <div className="font-medium">{order.sameAsBilling ? "Si" : "No"}</div>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
            Dati consegna registrati
          </div>
          <div>
            <div className="text-xs text-neutral-400">Referente consegna</div>
            <div className="font-medium">{safeValue(delivery?.referente_contatto)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Ragione sociale consegna</div>
            <div className="font-medium">{safeValue(delivery?.ragione_sociale)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Partita IVA consegna</div>
            <div className="font-medium">{safeValue(delivery?.partita_iva)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Indirizzo consegna</div>
            <div className="font-medium">{safeValue(delivery?.indirizzo)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">CAP / Citta / Provincia consegna</div>
            <div className="font-medium">
              {safeValue(
                [delivery?.cap ?? "", delivery?.citta ?? "", delivery?.provincia_regione ?? ""]
                  .filter(Boolean)
                  .join(" "),
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Nazione consegna</div>
            <div className="font-medium">{safeValue(delivery?.nazione)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
