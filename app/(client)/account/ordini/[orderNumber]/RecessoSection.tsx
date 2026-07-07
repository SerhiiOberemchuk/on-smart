"use client";

import WithdrawalForm from "@/components/WithdrawalForm";
import type { WithdrawalRequestType } from "@/db/schemas/withdrawal-requests.schema";
import {
  WITHDRAWAL_STATUS_LABEL_IT,
  WITHDRAWAL_STATUS_TEXT_CLASS,
} from "@/types/withdrawal.types";
import clsx from "clsx";
import { useState } from "react";

// Art. 54-bis: the withdrawal function must be prominently displayed and, for
// a logged-in customer, must not require re-identification (Dir. 2023/2673,
// recital 37) — hence the prefilled statement. The section is red-accented so
// this irreversible action stands apart from the rest of the order detail.
export default function RecessoSection({
  orderNumber,
  defaultNome,
  defaultEmail,
  withdrawal,
}: {
  orderNumber: string;
  defaultNome: string;
  defaultEmail: string;
  withdrawal: WithdrawalRequestType | null;
}) {
  const [showForm, setShowForm] = useState(false);

  if (withdrawal) {
    return (
      <section className="flex flex-col gap-2 rounded-sm border border-stroke-grey bg-white/2 p-4">
        <h2 className="H5">Diritto di recesso</h2>
        <p className="helper_text">
          Dichiarazione di recesso inviata il{" "}
          {new Intl.DateTimeFormat("it-IT", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "Europe/Rome",
          }).format(new Date(withdrawal.createdAt))}{" "}
          — stato:{" "}
          <strong className={WITHDRAWAL_STATUS_TEXT_CLASS[withdrawal.status]}>
            {WITHDRAWAL_STATUS_LABEL_IT[withdrawal.status]}
          </strong>
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-sm border border-red-500/40 bg-red-500/5 p-4">
      <h2 className="H5 flex items-center gap-2 text-red-300">
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M9 14 4 9l5-5" />
          <path d="M4 9h11a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5H8" />
        </svg>
        Diritto di recesso
      </h2>
      <p className="helper_text">
        Hai 14 giorni dalla consegna per recedere dall&apos;acquisto senza indicarne il motivo
        (artt. 52 e ss. Codice del Consumo).
      </p>
      {showForm ? (
        <WithdrawalForm orderNumber={orderNumber} defaultNome={defaultNome} defaultEmail={defaultEmail} />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={clsx(
            "self-start rounded-sm border border-red-500/60 px-4 py-2 font-medium text-red-300 transition",
            "hover:bg-red-500 hover:text-white",
          )}
        >
          Recedere dal contratto qui
        </button>
      )}
    </section>
  );
}
