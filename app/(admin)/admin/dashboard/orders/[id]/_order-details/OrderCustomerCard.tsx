import type { OrderTypes } from "@/db/schemas/orders.schema";
import { getClientTypeLabel, safeValue } from "./formatters";

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
    <div className="admin-card admin-card-content">
      <div className="mb-3 font-semibold">Клієнт</div>

      <div className="space-y-4 text-sm">
        <div>
          <div className="text-xs text-neutral-400">Тип клієнта</div>
          <div className="font-medium">{getClientTypeLabel(order.clientType)}</div>
        </div>

        <div className="border-t border-slate-600/45 pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
            Основні дані
          </div>
          <div>
            <div className="text-xs text-neutral-400">ПІБ / Назва компанії</div>
            <div className="font-medium">{safeValue(clientDisplayName)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Ел. пошта</div>
            <div className="font-medium break-all">{safeValue(order.email)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Телефон</div>
            <div className="font-medium">{safeValue(order.numeroTelefono)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Контактна особа</div>
            <div className="font-medium">{safeValue(order.referenteContatto)}</div>
          </div>
        </div>

        {isCompany ? (
          <div className="border-t border-slate-600/45 pt-4">
            <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
              Дані компанії
            </div>
            <div>
              <div className="text-xs text-neutral-400">Назва компанії</div>
              <div className="font-medium">{safeValue(order.ragioneSociale)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">ПДВ (IVA)</div>
              <div className="font-medium">{safeValue(order.partitaIva)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">PEC</div>
              <div className="font-medium break-all">{safeValue(order.pecAzzienda)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">Код SDI</div>
              <div className="font-medium">{safeValue(order.codiceUnico)}</div>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-600/45 pt-4">
            <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
              Дані приватної особи
            </div>
            <div>
              <div className="text-xs text-neutral-400">Ім'я</div>
              <div className="font-medium">{safeValue(order.nome)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">Прізвище</div>
              <div className="font-medium">{safeValue(order.cognome)}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-neutral-400">Фіскальний код</div>
              <div className="font-medium">{safeValue(order.codiceFiscale)}</div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-600/45 pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
            Адреса для рахунку
          </div>
          <div>
            <div className="text-xs text-neutral-400">Вулиця</div>
            <div className="font-medium">{safeValue(billingLine)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Індекс / Місто / Провінція</div>
            <div className="font-medium">{safeValue(billingCityLine)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Країна</div>
            <div className="font-medium">{safeValue(order.nazione)}</div>
          </div>
        </div>

        <div className="border-t border-slate-600/45 pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
            Рахунок
          </div>
          <div>
            <div className="text-xs text-neutral-400">Потрібен рахунок</div>
            <div className="font-medium">{requestInvoice ? "Так" : "Ні"}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Адреса доставки збігається з адресою рахунку</div>
            <div className="font-medium">{order.sameAsBilling ? "Так" : "Ні"}</div>
          </div>
        </div>

        <div className="border-t border-slate-600/45 pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
            Дані доставки з `deliveryAdress`
          </div>
          <div>
            <div className="text-xs text-neutral-400">Контакт доставки</div>
            <div className="font-medium">{safeValue(delivery?.referente_contatto)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Компанія доставки</div>
            <div className="font-medium">{safeValue(delivery?.ragione_sociale)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">ПДВ доставки</div>
            <div className="font-medium">{safeValue(delivery?.partita_iva)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Адреса доставки</div>
            <div className="font-medium">{safeValue(delivery?.indirizzo)}</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Індекс / Місто / Провінція доставки</div>
            <div className="font-medium">
              {safeValue(
                [delivery?.cap ?? "", delivery?.citta ?? "", delivery?.provincia_regione ?? ""]
                  .filter(Boolean)
                  .join(" "),
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-neutral-400">Країна доставки</div>
            <div className="font-medium">{safeValue(delivery?.nazione)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
