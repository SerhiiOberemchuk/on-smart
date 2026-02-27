import type { OrderTypes } from "@/db/schemas/orders.schema";
import { formatCurrencyEUR, safeValue } from "./formatters";

type DeliveryAddressEntry = {
  key: string;
  label: string;
  value: string;
};

type OrderShippingCardProps = {
  order: OrderTypes;
  deliveryLine: string;
  cityLine: string;
  deliveryAddressEntries: DeliveryAddressEntry[];
};

export function OrderShippingCard({
  order,
  deliveryLine,
  cityLine,
  deliveryAddressEntries,
}: OrderShippingCardProps) {
  const delivery = order.deliveryAdress;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 font-semibold">Spedizione</div>

      <div className="text-sm">
        <div className="text-xs text-neutral-400">Metodo</div>
        <div className="font-medium">{safeValue(order.deliveryMethod)}</div>
      </div>

      <div className="mt-3 text-sm">
        <div className="text-xs text-neutral-400">Indirizzo</div>
        <div className="font-medium">{safeValue(deliveryLine)}</div>
        <div className="mt-1 text-xs text-neutral-500">{safeValue(cityLine)}</div>
        <div className="mt-1 text-xs text-neutral-500">Nazione: {safeValue(delivery?.nazione ?? order.nazione)}</div>
      </div>

      <div className="mt-3 text-sm">
        <div className="text-xs text-neutral-400">Prezzo consegna</div>
        <div className="font-medium">{formatCurrencyEUR(Number(order.deliveryPrice) || 0)}</div>
      </div>

      <div className="mt-4 border-t border-neutral-800 pt-4 text-sm">
        <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
          deliveryAdress (tutti i campi)
        </div>

        {deliveryAddressEntries.length === 0 ? (
          <div className="text-neutral-400">-</div>
        ) : (
          <div className="space-y-2">
            {deliveryAddressEntries.map((entry) => (
              <div key={entry.key}>
                <div className="text-xs text-neutral-400 break-all">{entry.label}</div>
                <div className="font-medium break-all">{entry.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
