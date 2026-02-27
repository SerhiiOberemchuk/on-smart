import type { OrderTypes } from "@/db/schemas/orders.schema";
import { formatCurrencyEUR, getDeliveryMethodLabel, safeValue } from "./formatters";

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
    <div className="admin-card admin-card-content">
      <div className="mb-3 font-semibold">Доставка</div>

      <div className="text-sm">
        <div className="text-xs text-neutral-400">Метод</div>
        <div className="font-medium">{getDeliveryMethodLabel(order.deliveryMethod)}</div>
      </div>

      <div className="mt-3 text-sm">
        <div className="text-xs text-neutral-400">Адреса</div>
        <div className="font-medium">{safeValue(deliveryLine)}</div>
        <div className="mt-1 text-xs text-neutral-500">{safeValue(cityLine)}</div>
        <div className="mt-1 text-xs text-neutral-500">Країна: {safeValue(delivery?.nazione ?? order.nazione)}</div>
      </div>

      <div className="mt-3 text-sm">
        <div className="text-xs text-neutral-400">Вартість доставки</div>
        <div className="font-medium">{formatCurrencyEUR(Number(order.deliveryPrice) || 0)}</div>
      </div>

      <div className="mt-4 border-t border-slate-600/45 pt-4 text-sm">
        <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase">
          Дані deliveryAdress (усі поля)
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
