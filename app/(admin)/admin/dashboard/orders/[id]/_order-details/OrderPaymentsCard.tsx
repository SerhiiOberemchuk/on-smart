import type { OrderPaymentTypes } from "@/db/schemas/orders.schema";
import {
  centsFromAny,
  formatCurrencyEUR,
  formatDate,
  getPaymentProviderLabel,
  getPaymentStatusBadgeClass,
  getPaymentStatusLabel,
  safeValue,
} from "./formatters";

type OrderPaymentsCardProps = {
  payment: OrderPaymentTypes | null | undefined;
};

export function OrderPaymentsCard({ payment }: OrderPaymentsCardProps) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="font-semibold">Оплати</div>
        <div className="text-xs text-neutral-500">{payment ? 1 : 0}</div>
      </div>

      {!payment ? (
        <div className="p-4 text-sm text-neutral-400">Оплат немає</div>
      ) : (
        <div className="p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-medium">{getPaymentProviderLabel(payment.provider)}</div>
              <div className="text-xs break-all text-neutral-500">
                ID провайдера: {safeValue(payment.providerOrderId)}
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
                {getPaymentStatusLabel(payment.status)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
