"use client";

import icon_email_confirmed from "@/assets/icons/icon_email_confirm.svg";
import icon_pencil from "@/assets/icons/icon_add_review.svg";
import Image from "next/image";
import Link from "next/link";
import { useCheckoutStore } from "@/store/checkout-store";
import { InputsCheckoutStep1 } from "@/types/checkout-steps.types";

export default function RiepilogoDatiCliente({
  isModifica = true,
  externalData,
}: {
  isModifica?: boolean;
  externalData?: Partial<InputsCheckoutStep1>;
}) {
  const { dataFirstStep } = useCheckoutStore();

  const displayData = externalData || dataFirstStep;

  if (!displayData) return null;

  const {
    numeroTelefono,
    email,
    nome,
    indirizzo,
    città,
    cap,
    provincia_regione,
    cognome,
    numero_civico,
    nazione,
    client_type,
    codice_fiscale,
    codice_unico,
    partita_iva,
    pec_azzienda,
    ragione_sociale,
    request_invoice,
    referente_contatto,
  } = displayData;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Image src={icon_email_confirmed} alt="icon email confirmed" />
        <h3 className="H5">I tuoi dati</h3>
        {isModifica && (
          <Link
            href="/checkout/informazioni"
            className="ml-auto flex shrink-0 items-center gap-1 underline hover:text-yellow-600"
          >
            <Image src={icon_pencil} alt="icon pencil" /> Modifica
          </Link>
        )}
      </div>
      <div className="text_R mt-3 pl-8 text-text-grey">
        <p>{numeroTelefono}</p>
        <p>{email}</p>
        <p>{nome}</p>
        <p> {cognome}</p>
        <p>{cap}</p>
        <p>
          {indirizzo} {numero_civico}
        </p>
        <p>
          {città}, {provincia_regione}
        </p>
        <p>{nazione}</p>
        {request_invoice && (
          <>
            <p>Codice fiscale: {codice_fiscale}</p>
          </>
        )}
        {client_type === "azienda" && (
          <>
            <p>Referente: {referente_contatto}</p>
            <p>PEC: {pec_azzienda}</p>
            <p>Partita IVA: {partita_iva}</p>
            <p>Codice UNICO: {codice_unico}</p>
            <p>Ragione sociale: {ragione_sociale}</p>
          </>
        )}
      </div>
    </div>
  );
}
