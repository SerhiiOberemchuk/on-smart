import { formatDate, getStatusBadgeClass } from "./formatters";

type OrderHeaderProps = {
  orderNumber: string;
  orderStatus: string;
  createdAt: Date;
  updatedAt: Date;
  pending: boolean;
  onSave: () => void;
};

export function OrderHeader({ orderNumber, orderStatus, createdAt, updatedAt, pending, onSave }: OrderHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">
          Ordine <span className="text-neutral-300">#{orderNumber}</span>
        </h1>
        <div className="mt-1 text-sm text-neutral-400">
          Creato: {formatDate(createdAt)} | Aggiornato: {formatDate(updatedAt)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${getStatusBadgeClass(
            orderStatus,
          )}`}
        >
          {orderStatus}
        </span>

        <button
          onClick={onSave}
          disabled={pending}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
