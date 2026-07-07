"use client";

import { SubmitButton } from "@/app/(client)/(auth)/components/SubmitButton";
import type { AddressFormState } from "@/app/actions/account/addresses/address-action.types";
import { createAddress } from "@/app/actions/account/addresses/create-address";
import { deleteAddress } from "@/app/actions/account/addresses/delete-address";
import { setDefaultAddress } from "@/app/actions/account/addresses/set-default-address";
import { InputBlock } from "@/components/InputBloc";
import type { UserAddressType } from "@/db/schemas/user-addresses.schema";
import clsx from "clsx";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

const INITIAL: AddressFormState = { success: false, message: null };

export default function AddressManager({ addresses }: { addresses: UserAddressType[] }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);

  return (
    <div className="flex flex-col gap-6">
      {addresses.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="flex flex-col gap-2 rounded-sm border border-stroke-grey p-4">
              <div className="flex flex-wrap items-center gap-2">
                {address.label && <span className="font-medium">{address.label}</span>}
                {address.isDefaultShipping && (
                  <span className="rounded border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-xs text-blue-300">
                    Spedizione
                  </span>
                )}
                {address.isDefaultBilling && (
                  <span className="rounded border border-green-500/40 bg-green-500/15 px-2 py-0.5 text-xs text-green-300">
                    Fatturazione
                  </span>
                )}
              </div>
              <p className="helper_text">
                {(address.nome || address.cognome) && (
                  <>
                    {address.nome} {address.cognome}
                    <br />
                  </>
                )}
                {address.indirizzo} {address.numeroCivico}
                <br />
                {address.cap} {address.citta} ({address.provinciaRegione}) {address.nazione}
              </p>
              <div className="mt-1 flex flex-wrap gap-3 text-sm">
                {!address.isDefaultShipping && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={address.id} />
                    <input type="hidden" name="kind" value="shipping" />
                    <FormButton>Predefinito spedizione</FormButton>
                  </form>
                )}
                {!address.isDefaultBilling && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={address.id} />
                    <input type="hidden" name="kind" value="billing" />
                    <FormButton>Predefinito fatturazione</FormButton>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <FormButton danger>Elimina</FormButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <AddAddressForm onClose={() => setShowForm(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="self-start rounded-sm border border-stroke-grey px-4 py-2 transition hover:border-yellow-500/60 hover:bg-white/5"
        >
          + Aggiungi indirizzo
        </button>
      )}
    </div>
  );
}

export function AddAddressForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [state, formAction] = useActionState(createAddress, INITIAL);

  useEffect(() => {
    if (state.success) onSaved?.();
  }, [state, onSaved]);

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-4 rounded-sm border border-stroke-grey p-4"
    >
      <h2 className="H5">Nuovo indirizzo</h2>
      <InputBlock title="Etichetta (es. Casa)" name="label" />
      <InputBlock title="Nome" name="nome" />
      <InputBlock title="Cognome" name="cognome" />
      <InputBlock title="Telefono" name="numeroTelefono" type="tel" />
      <InputBlock title="Indirizzo" name="indirizzo" required />
      <InputBlock title="Civico" name="numeroCivico" required />
      <InputBlock title="Città" name="citta" required />
      <InputBlock title="CAP" name="cap" required />
      <InputBlock title="Provincia" name="provinciaRegione" required />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isDefaultShipping" /> Predefinito per spedizione
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isDefaultBilling" /> Predefinito per fatturazione
      </label>
      {state.message && (
        <p className={clsx("text-sm", state.success ? "text-green-400" : "text-red-400")}>
          {state.message}
        </p>
      )}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SubmitButton>Salva indirizzo</SubmitButton>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm border border-stroke-grey px-4 py-2 transition hover:border-yellow-500/60 hover:bg-white/5"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}

function FormButton({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "underline disabled:pointer-events-none disabled:opacity-60",
        danger ? "text-red-400" : "text-yellow-500",
      )}
    >
      {pending ? "..." : children}
    </button>
  );
}
