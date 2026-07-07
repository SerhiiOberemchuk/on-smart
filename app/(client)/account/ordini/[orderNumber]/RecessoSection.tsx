"use client";

import WithdrawalForm from "@/components/WithdrawalForm";
import type { WithdrawalRequestType } from "@/db/schemas/withdrawal-requests.schema";
import { WITHDRAWAL_STATUS_LABEL_IT } from "@/types/withdrawal.types";
import { useState } from "react";

// Art. 54-bis: the withdrawal function must be prominently displayed and, for
// a logged-in customer, must not require re-identification (Dir. 2023/2673,
// recital 37) — hence the prefilled statement.
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
      <section className="flex flex-col gap-2 rounded-sm border border-stroke-grey p-4">
        <h2 className="H5">Diritto di recesso</h2>
        <p className="helper_text">
          Dichiarazione di recesso inviata il{" "}
          {new Intl.DateTimeFormat("it-IT", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "Europe/Rome",
          }).format(new Date(withdrawal.createdAt))}{" "}
          — stato: <strong>{WITHDRAWAL_STATUS_LABEL_IT[withdrawal.status]}</strong>
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-sm border border-stroke-grey p-4">
      <h2 className="H5">Diritto di recesso</h2>
      <p className="helper_text">
        Hai 14 giorni dalla consegna per recedere dall&apos;acquisto senza indicarne il motivo
        (artt. 52 e ss. Codice del Consumo).
      </p>
      {showForm ? (
        <WithdrawalForm
          orderNumber={orderNumber}
          defaultNome={defaultNome}
          defaultEmail={defaultEmail}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="self-start rounded-sm border border-stroke-grey px-4 py-2 transition hover:bg-white/5"
        >
          Recedere dal contratto qui
        </button>
      )}
    </section>
  );
}
