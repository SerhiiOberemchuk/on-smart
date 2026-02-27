import { ORDER_STATUS_LIST, type OrderStatusTypes } from "@/types/orders.types";
import { getOrderStatusLabel } from "./formatters";

type OrderManagementCardProps = {
  status: OrderStatusTypes | "";
  onStatusChange: (value: OrderStatusTypes) => void;
  carrier: string;
  onCarrierChange: (value: string) => void;
  trackingNumber: string;
  onTrackingNumberChange: (value: string) => void;
  shippedAt: string;
  onShippedAtChange: (value: string) => void;
  deliveredAt: string;
  onDeliveredAtChange: (value: string) => void;
  requestInvoice: boolean;
  onRequestInvoiceChange: (value: boolean) => void;
  pending: boolean;
  onSave: () => void;
};

export function OrderManagementCard({
  status,
  onStatusChange,
  carrier,
  onCarrierChange,
  trackingNumber,
  onTrackingNumberChange,
  shippedAt,
  onShippedAtChange,
  deliveredAt,
  onDeliveredAtChange,
  requestInvoice,
  onRequestInvoiceChange,
  pending,
  onSave,
}: OrderManagementCardProps) {
  return (
    <div className="admin-card admin-card-content">
      <div className="mb-3 font-semibold">Керування замовленням</div>

      <label className="mb-1 block text-xs text-neutral-400">Статус замовлення</label>
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as OrderStatusTypes)}
        className="admin-select"
      >
        {ORDER_STATUS_LIST.map((orderStatus) => (
          <option key={orderStatus} value={orderStatus}>
            {getOrderStatusLabel(orderStatus)}
          </option>
        ))}
      </select>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Перевізник</label>
          <input
            value={carrier}
            onChange={(event) => onCarrierChange(event.target.value)}
            className="admin-input"
            placeholder="напр. GLS / BRT / UPS"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-400">Трек-номер</label>
          <input
            value={trackingNumber}
            onChange={(event) => onTrackingNumberChange(event.target.value)}
            className="admin-input"
            placeholder="Код відстеження"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Відправлено</label>
            <input
              type="datetime-local"
              value={shippedAt}
              onChange={(event) => onShippedAtChange(event.target.value)}
              className="admin-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">Доставлено</label>
            <input
              type="datetime-local"
              value={deliveredAt}
              onChange={(event) => onDeliveredAtChange(event.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={requestInvoice}
            onChange={(event) => onRequestInvoiceChange(event.target.checked)}
            className="admin-checkbox"
          />
          Потрібен рахунок
        </label>
      </div>

      <button
        onClick={onSave}
        disabled={pending}
        className="admin-btn-primary mt-4 w-full !text-sm"
      >
        {pending ? "Збереження..." : "Зберегти"}
      </button>
    </div>
  );
}
