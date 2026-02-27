import type { OrderPaymentTypes } from "@/db/schemas/orders.schema";
import { centsFromAny, formatCurrencyEUR, formatDate, getPaymentStatusBadgeClass, safeValue } from "./formatters";

type OrderPaymentsCardProps = {
  payment: OrderPaymentTypes | null | undefined;
};

export function OrderPaymentsCard({ payment }: OrderPaymentsCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="font-semibold">Pagamenti</div>
        <div className="text-xs text-neutral-500">{payment ? 1 : 0}</div>
      </div>

      {!payment ? (
        <div className="p-4 text-sm text-neutral-400">Nessun pagamento</div>
      ) : (
        <div className="p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-medium capitalize">{payment.provider}</div>
              <div className="text-xs break-all text-neutral-500">
                Provider ID: {safeValue(payment.providerOrderId)}
              </div>
              <div className="text-xs text-neutral-500">
                {formatDate(payment.createdAt)} | {formatDate(payment.updatedAt)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">{formatCurrencyEUR(centsFromAny(payment.amount))}</div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${getPaymentStatusBadgeClass(
                  payment.status,
                )}`}
              >
                {payment.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
