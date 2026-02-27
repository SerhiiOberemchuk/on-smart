import { formatDate, getOrderStatusLabel, getStatusBadgeClass } from "./formatters";

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
    <div className="admin-page-header">
      <div>
        <h1 className="admin-title">
          Замовлення <span className="text-neutral-300">#{orderNumber}</span>
        </h1>
        <div className="admin-subtitle">
          Створено: {formatDate(createdAt)} | Оновлено: {formatDate(updatedAt)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${getStatusBadgeClass(
            orderStatus,
          )}`}
        >
          {getOrderStatusLabel(orderStatus)}
        </span>

        <button
          onClick={onSave}
          disabled={pending}
          className="admin-btn-primary !px-4 !py-2 !text-sm"
        >
          {pending ? "Збереження..." : "Зберегти зміни"}
        </button>
      </div>
    </div>
  );
}
