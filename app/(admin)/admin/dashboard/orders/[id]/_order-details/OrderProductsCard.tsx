import type { OrderItemsTypes } from "@/db/schemas/orders.schema";
import { centsFromAny, formatCurrencyEUR, safeValue } from "./formatters";

type OrderProductsCardProps = {
  orderItems: OrderItemsTypes[] | null | undefined;
  totals: {
    itemsSubtotal: number;
    delivery: number;
    total: number;
  };
};

export function OrderProductsCard({ orderItems, totals }: OrderProductsCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="font-semibold">Prodotti</div>
        <div className="text-xs text-neutral-500">{orderItems?.length ?? 0} righe</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800/60 text-xs tracking-wider text-neutral-400 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Articolo</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Prezzo</th>
              <th className="px-4 py-3 text-left">Totale</th>
            </tr>
          </thead>
          <tbody>
            {(orderItems ?? []).map((item) => {
              const unitPrice = centsFromAny(item.unitPrice);
              const rowTotal = unitPrice * (item.quantity ?? 0);

              return (
                <tr key={item.id} className="border-t border-neutral-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-neutral-500">
                      {safeValue(item.brandName)} | {safeValue(item.categoryName)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{formatCurrencyEUR(unitPrice)}</td>
                  <td className="px-4 py-3">{formatCurrencyEUR(rowTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-neutral-800 p-4 text-sm">
        <div className="ml-auto w-full max-w-sm space-y-2">
          <div className="flex justify-between text-neutral-300">
            <span>Subtotale</span>
            <span>{formatCurrencyEUR(totals.itemsSubtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span>Consegna</span>
            <span>{formatCurrencyEUR(totals.delivery)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-800 pt-2 font-semibold text-white">
            <span>Totale</span>
            <span>{formatCurrencyEUR(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
