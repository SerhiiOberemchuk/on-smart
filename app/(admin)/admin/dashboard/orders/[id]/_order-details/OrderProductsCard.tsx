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
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="font-semibold">Товари</div>
        <div className="text-xs text-neutral-500">{orderItems?.length ?? 0} позицій</div>
      </div>

      <div className="admin-table-wrap !rounded-none !border-x-0 !border-y-0">
        <table className="admin-table !min-w-[42rem]">
          <thead>
            <tr>
              <th>Товар</th>
              <th>К-сть</th>
              <th>Ціна</th>
              <th>Сума</th>
            </tr>
          </thead>
          <tbody>
            {(orderItems ?? []).map((item) => {
              const unitPrice = centsFromAny(item.unitPrice);
              const rowTotal = unitPrice * (item.quantity ?? 0);

              return (
                <tr key={item.id}>
                  <td>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-neutral-500">
                      {safeValue(item.brandName)} | {safeValue(item.categoryName)}
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrencyEUR(unitPrice)}</td>
                  <td>{formatCurrencyEUR(rowTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-600/45 p-4 text-sm">
        <div className="ml-auto w-full max-w-sm space-y-2">
          <div className="flex justify-between text-neutral-300">
            <span>Підсумок товарів</span>
            <span>{formatCurrencyEUR(totals.itemsSubtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span>Доставка</span>
            <span>{formatCurrencyEUR(totals.delivery)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-600/45 pt-2 font-semibold text-white">
            <span>Разом</span>
            <span>{formatCurrencyEUR(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
