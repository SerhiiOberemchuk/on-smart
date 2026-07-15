"use client";

import { ReactNode, useState } from "react";

/**
 * Checkout section shown as a collapsed "summary + Cambia" row. Sections whose
 * selection is incomplete open by default so the customer is prompted; complete
 * ones stay collapsed as a quick review.
 */
export default function CheckoutReviewSection({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-sm border border-stroke-grey">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h2 className="H5">{title}</h2>
          {!open && <div className="helper_text mt-1">{summary}</div>}
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="shrink-0 text-sm text-yellow-500 underline underline-offset-2 transition hover:opacity-80"
        >
          {open ? "Chiudi" : "Cambia"}
        </button>
      </div>

      {open && <div className="border-t border-stroke-grey p-4">{children}</div>}
    </section>
  );
}
