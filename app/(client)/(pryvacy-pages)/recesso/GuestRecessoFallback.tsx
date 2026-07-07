"use client";

import WithdrawalForm from "@/components/WithdrawalForm";
import { useState } from "react";

// Legally required fallback: contracts concluded after 19 June 2026 without an
// account (guest checkout era) must still have an online withdrawal function
// that is not more burdensome than the contract conclusion was (Dir. 2023/2673,
// recital 36). Removable once every guest order's withdrawal window has closed.
export default function GuestRecessoFallback() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 border-t border-stroke-grey pt-4">
      <h2 className="H5 text-white">Hai ordinato senza un account?</h2>
      <p className="helper_text">
        Se il tuo ordine è stato effettuato come ospite, puoi inviare la dichiarazione di recesso
        con questo modulo indicando il numero d&apos;ordine che trovi nell&apos;email di conferma.
      </p>
      {open ? (
        <WithdrawalForm />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-start rounded-sm border border-stroke-grey px-4 py-2 transition hover:bg-white/5"
        >
          Compila il modulo di recesso
        </button>
      )}
    </div>
  );
}
