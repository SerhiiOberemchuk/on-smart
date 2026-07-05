"use client";

import { SubmitButton } from "@/app/(client)/(auth)/components/SubmitButton";
import { updateCustomerProfile } from "@/app/actions/account/profile/update-customer-profile";
import type { ProfileFormState } from "@/app/actions/account/profile/profile-action.types";
import { InputBlock } from "@/components/InputBloc";
import type { CustomerProfileType } from "@/db/schemas/customer-profile.schema";
import clsx from "clsx";
import { useActionState, useState } from "react";

const INITIAL: ProfileFormState = { success: false, message: null };

export default function ProfiloForm({
  profile,
  email,
}: {
  profile: CustomerProfileType | null;
  email: string;
}) {
  const [state, formAction] = useActionState(updateCustomerProfile, INITIAL);
  const [clientType, setClientType] = useState<"privato" | "azienda">(
    profile?.clientType ?? "privato",
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <p className="helper_text">
        Email: <strong>{email}</strong> (non modificabile)
      </p>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="clientType"
            value="privato"
            checked={clientType === "privato"}
            onChange={() => setClientType("privato")}
          />
          Privato
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="clientType"
            value="azienda"
            checked={clientType === "azienda"}
            onChange={() => setClientType("azienda")}
          />
          Azienda
        </label>
      </div>

      <InputBlock
        title="Telefono"
        name="numeroTelefono"
        type="tel"
        defaultValue={profile?.numeroTelefono ?? ""}
      />

      {clientType === "privato" ? (
        <>
          <InputBlock title="Nome" name="nome" defaultValue={profile?.nome ?? ""} />
          <InputBlock title="Cognome" name="cognome" defaultValue={profile?.cognome ?? ""} />
          <InputBlock
            title="Codice Fiscale"
            name="codiceFiscale"
            defaultValue={profile?.codiceFiscale ?? ""}
          />
        </>
      ) : (
        <>
          <InputBlock
            title="Referente"
            name="referenteContatto"
            defaultValue={profile?.referenteContatto ?? ""}
          />
          <InputBlock
            title="Ragione sociale"
            name="ragioneSociale"
            defaultValue={profile?.ragioneSociale ?? ""}
          />
          <InputBlock
            title="Partita IVA"
            name="partitaIva"
            defaultValue={profile?.partitaIva ?? ""}
          />
          <InputBlock
            title="PEC"
            name="pecAzzienda"
            type="email"
            defaultValue={profile?.pecAzzienda ?? ""}
          />
          <InputBlock
            title="Codice Univoco"
            name="codiceUnico"
            defaultValue={profile?.codiceUnico ?? ""}
          />
        </>
      )}

      <fieldset className="flex flex-col gap-3 border-t border-stroke-grey pt-5">
        <legend className="H5">Preferenze ordine</legend>

        <div className="flex flex-col gap-1">
          <span className="helper_text">Consegna predefinita</span>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="defaultDeliveryMethod"
              value="CONSEGNA_CORRIERE"
              defaultChecked={(profile?.defaultDeliveryMethod ?? "CONSEGNA_CORRIERE") === "CONSEGNA_CORRIERE"}
            />
            Corriere
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="defaultDeliveryMethod"
              value="RITIRO_NEGOZIO"
              defaultChecked={profile?.defaultDeliveryMethod === "RITIRO_NEGOZIO"}
            />
            Ritiro in negozio
          </label>
        </div>

        <label className="helper_text flex flex-col gap-1">
          Pagamento predefinito
          <select
            name="defaultPaymentMethod"
            defaultValue={profile?.defaultPaymentMethod ?? ""}
            className="border-b border-stroke-grey text-text-grey outline-0"
          >
            <option value="">Chiedi ogni volta</option>
            <option value="sumup">Carta (SumUp)</option>
            <option value="paypal">PayPal</option>
            <option value="klarna">Klarna</option>
            <option value="bonifico">Bonifico</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="requestInvoiceDefault"
            defaultChecked={profile?.requestInvoiceDefault ?? false}
          />
          Richiedi fattura per impostazione predefinita
        </label>
      </fieldset>

      {state.message && (
        <p className={clsx("text-sm", state.success ? "text-green-700" : "text-red-600")}>
          {state.message}
        </p>
      )}
      <SubmitButton>Salva</SubmitButton>
    </form>
  );
}
