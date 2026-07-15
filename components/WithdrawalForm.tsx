"use client";

import { SubmitButton } from "@/app/(client)/(auth)/components/SubmitButton";
import { submitWithdrawalRequest } from "@/app/actions/withdrawal/submit-withdrawal-request";
import { InputBlock } from "@/components/InputBloc";
import type { WithdrawalFormState } from "@/types/withdrawal.types";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

const INITIAL: WithdrawalFormState = { success: false, message: null };

export type WithdrawalOrderChoice = {
  orderNumber: string;
  label: string;
};

// The online withdrawal statement per art. 54-bis comma 2 Codice del Consumo:
// name, contract identification (order number), electronic contact for the
// receipt. The submit button is the "funzione di conferma" (comma 5) and must
// be labelled only "Conferma recesso".
export default function WithdrawalForm({
  defaultNome = "",
  defaultEmail = "",
  orderNumber,
  orderChoices,
  onSuccess,
}: {
  defaultNome?: string;
  defaultEmail?: string;
  /** When set, the order is fixed (account order-detail flow) and not editable. */
  orderNumber?: string;
  /** When set, the consumer picks the order from their own list (account flow). */
  orderChoices?: WithdrawalOrderChoice[];
  /** Fired once when the statement is accepted (to reflect it in a list). */
  onSuccess?: (orderNumber?: string) => void;
}) {
  const [state, formAction] = useActionState(submitWithdrawalRequest, INITIAL);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (state.success && !notifiedRef.current) {
      notifiedRef.current = true;
      onSuccess?.(orderNumber);
    }
  }, [state.success, onSuccess, orderNumber]);

  if (state.success) {
    return (
      <div className="flex flex-col gap-2 rounded-sm border border-green-500/40 bg-green-500/10 p-4">
        <p className="font-medium text-green-300">Dichiarazione di recesso inviata</p>
        <p className="helper_text">{state.message}</p>
        {state.submittedAt && (
          <p className="helper_text">
            Data e ora di trasmissione:{" "}
            <strong className="text-white">
              {new Intl.DateTimeFormat("it-IT", {
                dateStyle: "long",
                timeStyle: "medium",
                timeZone: "Europe/Rome",
              }).format(new Date(state.submittedAt))}
            </strong>
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <InputBlock title="Nome e cognome" name="nome" required defaultValue={defaultNome} />
      {orderNumber ? (
        <>
          <p className="helper_text">
            Ordine: <strong className="text-white">{orderNumber}</strong>
          </p>
          <input type="hidden" name="orderNumber" value={orderNumber} />
        </>
      ) : orderChoices ? (
        <OrderPicker choices={orderChoices} />
      ) : (
        <InputBlock title="Numero ordine (es. OS...)" name="orderNumber" required />
      )}
      <InputBlock
        title="Email (per la conferma di ricezione)"
        name="email"
        type="email"
        required
        defaultValue={defaultEmail}
      />
      <label className="helper_text flex flex-col gap-1">
        Note (facoltative — es. prodotti interessati)
        <textarea
          name="message"
          rows={3}
          className="rounded-sm border border-stroke-grey bg-transparent p-2 text-white outline-none transition focus:border-yellow-500"
        />
      </label>

      {state.message && <p className="text-sm text-red-400">{state.message}</p>}
      <SubmitButton>Conferma recesso</SubmitButton>
    </form>
  );
}

// The customer may have many orders — offer a search and cap the list height so
// it does not become one huge scroll of radios.
function OrderPicker({ choices }: { choices: WithdrawalOrderChoice[] }) {
  const [query, setQuery] = useState("");
  const showSearch = choices.length > 5;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return choices;
    return choices.filter((choice) =>
      `${choice.orderNumber} ${choice.label}`.toLowerCase().includes(normalized),
    );
  }, [choices, query]);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="helper_text mb-1">Seleziona l&apos;ordine</legend>

      {showSearch && (
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca per numero ordine…"
          className="rounded-sm border border-stroke-grey bg-background px-3 py-2 text-sm outline-none transition focus:border-yellow-500"
        />
      )}

      <div className="flex max-h-72 flex-col gap-1 overflow-auto rounded-sm border border-stroke-grey p-1">
        {filtered.length === 0 ? (
          <p className="helper_text p-2">Nessun ordine trovato.</p>
        ) : (
          filtered.map((choice, index) => (
            <label
              key={choice.orderNumber}
              className="flex cursor-pointer items-start gap-2 rounded-sm border border-transparent p-2 transition hover:bg-white/5 has-[:checked]:border-yellow-500/40 has-[:checked]:bg-yellow-500/10"
            >
              <input
                type="radio"
                name="orderNumber"
                value={choice.orderNumber}
                required
                defaultChecked={choices.length === 1 && index === 0}
              />
              <span className="helper_text">
                <strong className="text-white">{choice.orderNumber}</strong> — {choice.label}
              </span>
            </label>
          ))
        )}
      </div>

      {showSearch && (
        <p className="helper_text">
          {filtered.length} di {choices.length} ordini
        </p>
      )}
    </fieldset>
  );
}
