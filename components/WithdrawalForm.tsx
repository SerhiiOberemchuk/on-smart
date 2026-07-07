"use client";

import { SubmitButton } from "@/app/(client)/(auth)/components/SubmitButton";
import { submitWithdrawalRequest } from "@/app/actions/withdrawal/submit-withdrawal-request";
import { InputBlock } from "@/components/InputBloc";
import type { WithdrawalFormState } from "@/types/withdrawal.types";
import { useActionState } from "react";

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
}: {
  defaultNome?: string;
  defaultEmail?: string;
  /** When set, the order is fixed (account order-detail flow) and not editable. */
  orderNumber?: string;
  /** When set, the consumer picks the order from their own list (account flow). */
  orderChoices?: WithdrawalOrderChoice[];
}) {
  const [state, formAction] = useActionState(submitWithdrawalRequest, INITIAL);

  if (state.success) {
    return (
      <div className="flex flex-col gap-2 rounded-sm border border-stroke-grey bg-white/5 p-4">
        <p className="font-medium text-green-400">Dichiarazione di recesso inviata</p>
        <p className="helper_text">{state.message}</p>
        {state.submittedAt && (
          <p className="helper_text">
            Data e ora di trasmissione:{" "}
            <strong>
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
            Ordine: <strong>{orderNumber}</strong>
          </p>
          <input type="hidden" name="orderNumber" value={orderNumber} />
        </>
      ) : orderChoices ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="helper_text mb-1">Seleziona l&apos;ordine</legend>
          {orderChoices.map((choice, index) => (
            <label key={choice.orderNumber} className="flex items-start gap-2">
              <input
                type="radio"
                name="orderNumber"
                value={choice.orderNumber}
                required
                defaultChecked={orderChoices.length === 1 && index === 0}
              />
              <span className="helper_text">
                <strong>{choice.orderNumber}</strong> — {choice.label}
              </span>
            </label>
          ))}
        </fieldset>
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
          className="border-b border-stroke-grey text-text-grey outline-0"
        />
      </label>

      {state.message && <p className="text-sm text-red-400">{state.message}</p>}
      <SubmitButton>Conferma recesso</SubmitButton>
    </form>
  );
}
