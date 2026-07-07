"use client";

import type { CustomerProfileType } from "@/db/schemas/customer-profile.schema";
import Link from "next/link";
import CheckoutBillingForm from "./CheckoutBillingForm";

export default function FatturazioneSection({
  email,
  profile,
  profileComplete,
  requestInvoice,
  onRequestInvoiceChange,
  onProfileSaved,
}: {
  email: string;
  profile: CustomerProfileType | null;
  profileComplete: boolean;
  requestInvoice: boolean;
  onRequestInvoiceChange: (value: boolean) => void;
  onProfileSaved: () => void;
}) {
  return (
    <section className="flex flex-col gap-2 rounded-sm border border-stroke-grey p-4">
      <div className="flex items-center justify-between">
        <h2 className="H5">Fatturazione</h2>
        {profileComplete && (
          <Link href="/account/profilo" className="text-yellow-500 text-sm underline">
            Modifica nel profilo
          </Link>
        )}
      </div>

      {profileComplete ? (
        <>
          <p className="helper_text">
            {profile?.clientType === "azienda"
              ? profile?.ragioneSociale
              : `${profile?.nome ?? ""} ${profile?.cognome ?? ""}`.trim()}
            <br />
            {email} · {profile?.numeroTelefono}
            {profile?.partitaIva ? <> · P. IVA {profile.partitaIva}</> : null}
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requestInvoice}
              onChange={(event) => onRequestInvoiceChange(event.target.checked)}
            />
            Richiedi fattura
          </label>
        </>
      ) : (
        <CheckoutBillingForm profile={profile} onSaved={onProfileSaved} />
      )}
    </section>
  );
}
