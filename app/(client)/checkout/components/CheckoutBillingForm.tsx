"use client";

import { SubmitButton } from "@/app/(client)/(auth)/components/SubmitButton";
import type { ProfileFormState } from "@/app/actions/account/profile/profile-action.types";
import { updateCustomerProfile } from "@/app/actions/account/profile/update-customer-profile";
import { InputBlock } from "@/components/InputBloc";
import type { CustomerProfileType } from "@/db/schemas/customer-profile.schema";
import type { ClientType } from "@/types/orders.types";
import { useActionState, useEffect, useState } from "react";

const INITIAL: ProfileFormState = { success: false, message: null };

export default function CheckoutBillingForm({
  profile,
  onSaved,
}: {
  profile: CustomerProfileType | null;
  onSaved: () => void;
}) {
  const [state, formAction] = useActionState(updateCustomerProfile, INITIAL);
  const [clientType, setClientType] = useState<ClientType>(profile?.clientType ?? "privato");

  useEffect(() => {
    if (state.success) onSaved();
  }, [state, onSaved]);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <p className="helper_text">
        Completa i dati di fatturazione: verranno salvati nel tuo profilo per i prossimi ordini.
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
        required
        defaultValue={profile?.numeroTelefono ?? ""}
      />

      {clientType === "privato" ? (
        <>
          <InputBlock title="Nome" name="nome" required defaultValue={profile?.nome ?? ""} />
          <InputBlock title="Cognome" name="cognome" required defaultValue={profile?.cognome ?? ""} />
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
            required
            defaultValue={profile?.ragioneSociale ?? ""}
          />
          <InputBlock
            title="Partita IVA"
            name="partitaIva"
            required
            defaultValue={profile?.partitaIva ?? ""}
          />
          <InputBlock title="PEC" name="pecAzzienda" type="email" defaultValue={profile?.pecAzzienda ?? ""} />
          <InputBlock title="Codice Univoco" name="codiceUnico" defaultValue={profile?.codiceUnico ?? ""} />
        </>
      )}

      {/* updateCustomerProfile writes the full row — carry the existing order
          defaults through hidden fields so this mini-form cannot wipe them. */}
      <input
        type="hidden"
        name="defaultDeliveryMethod"
        value={profile?.defaultDeliveryMethod ?? "CONSEGNA_CORRIERE"}
      />
      <input type="hidden" name="defaultPaymentMethod" value={profile?.defaultPaymentMethod ?? ""} />
      {profile?.requestInvoiceDefault && (
        <input type="hidden" name="requestInvoiceDefault" value="on" />
      )}

      {state.message && !state.success && <p className="text-sm text-red-400">{state.message}</p>}
      <SubmitButton>Salva e continua</SubmitButton>
    </form>
  );
}
