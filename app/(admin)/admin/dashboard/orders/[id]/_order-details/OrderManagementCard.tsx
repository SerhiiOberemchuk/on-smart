import { ORDER_STATUS_LIST, type OrderStatusTypes } from "@/types/orders.types";

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
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 font-semibold">Gestione ordine</div>

      <label className="mb-1 block text-xs text-neutral-400">Stato ordine</label>
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as OrderStatusTypes)}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
      >
        {ORDER_STATUS_LIST.map((orderStatus) => (
          <option key={orderStatus} value={orderStatus}>
            {orderStatus}
          </option>
        ))}
      </select>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Carrier</label>
          <input
            value={carrier}
            onChange={(event) => onCarrierChange(event.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            placeholder="es. GLS / BRT / UPS"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-400">Tracking number</label>
          <input
            value={trackingNumber}
            onChange={(event) => onTrackingNumberChange(event.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            placeholder="Tracking code"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Shipped at</label>
            <input
              type="datetime-local"
              value={shippedAt}
              onChange={(event) => onShippedAtChange(event.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">Delivered at</label>
            <input
              type="datetime-local"
              value={deliveredAt}
              onChange={(event) => onDeliveredAtChange(event.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </div>
        </div>

        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={requestInvoice}
            onChange={(event) => onRequestInvoiceChange(event.target.checked)}
          />
          Richiede fattura
        </label>
      </div>

      <button
        onClick={onSave}
        disabled={pending}
        className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
