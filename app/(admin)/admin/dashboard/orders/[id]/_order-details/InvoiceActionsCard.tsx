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
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-2 font-semibold">Fattura PDF</div>
      <p className="text-xs text-neutral-400">
        Privato: disponibile solo con &quot;Richiede fattura&quot;. Azienda: sempre disponibile.
      </p>

      <button
        onClick={onGenerateInvoice}
        disabled={!canGenerateInvoice || generating}
        className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating ? "Generating PDF..." : "Generate invoice PDF"}
      </button>

      {!canGenerateInvoice && blockReason ? (
        <p className="mt-2 text-xs text-amber-300">{blockReason}</p>
      ) : null}
    </div>
  );
}
