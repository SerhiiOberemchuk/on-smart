type InvoiceActionsCardProps = {
  canGenerateInvoice: boolean;
  blockReason: string | null;
  generating: boolean;
  onGenerateInvoice: () => void;
};

export function InvoiceActionsCard({
  canGenerateInvoice,
  blockReason,
  generating,
  onGenerateInvoice,
}: InvoiceActionsCardProps) {
  return (
    <div className="admin-card admin-card-content">
      <div className="mb-2 font-semibold">PDF-рахунок</div>
      <p className="text-xs text-neutral-400">
        Для приватного клієнта: доступно тільки якщо позначено «Потрібен рахунок». Для організації: завжди доступно.
      </p>

      <button
        onClick={onGenerateInvoice}
        disabled={!canGenerateInvoice || generating}
        className="admin-btn-primary mt-4 w-full !text-sm disabled:cursor-not-allowed"
      >
        {generating ? "Генерація PDF..." : "Згенерувати PDF-рахунок"}
      </button>

      {!canGenerateInvoice && blockReason ? (
        <p className="mt-2 text-xs text-amber-300">{blockReason}</p>
      ) : null}
    </div>
  );
}
