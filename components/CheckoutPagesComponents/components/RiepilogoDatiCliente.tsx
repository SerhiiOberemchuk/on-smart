"use client";

import icon_email_confirmed from "@/assets/icons/icon_email_confirm.svg";
import icon_pencil from "@/assets/icons/icon_add_review.svg";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { CheckoutTypesDataFirstStep, useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";

export default function RiepilogoDatiCliente({
  isModifica = true,
  externalData,
}: {
  isModifica?: boolean;
  externalData?: CheckoutTypesDataFirstStep;
}) {
  const { dataFirstStep } = useCheckoutStore();

  const displayData = externalData || dataFirstStep;

  if (!displayData) return null;

  const {
    numeroTelefono,
    email,
    nome,
    indirizzo,
    citta,
    cap,
    provinciaRegione,
    cognome,
    numeroCivico,
    nazione,
    clientType,
    codiceFiscale,
    codiceUnico,
    partitaIva,
    pecAzzienda,
    ragioneSociale,
    requestInvoice,
    referenteContatto,
  } = displayData;

  return (
    <div>
      <div className="flex items-center gap-2">
        <SmartImage src={icon_email_confirmed} alt="" aria-hidden="true" />
        <h3 className="H5">I tuoi dati</h3>
        {isModifica && (
          <Link
            href={PAGES.CHECKOUT_PAGES.INFORMATION}
            aria-label="Modifica i tuoi dati"
            className="ml-auto flex shrink-0 items-center gap-1 underline hover:text-yellow-600"
          >
            <SmartImage src={icon_pencil} alt="" aria-hidden="true" /> Modifica
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
          {indirizzo} {numeroCivico}
        </p>
        <p>
          {citta}, {provinciaRegione}
        </p>
        <p>{nazione}</p>
        {requestInvoice && (
          <>
            <p>Codice fiscale: {codiceFiscale}</p>
          </>
        )}
        {clientType === "azienda" && (
          <>
            <p>Referente: {referenteContatto}</p>
            <p>PEC: {pecAzzienda}</p>
            <p>Partita IVA: {partitaIva}</p>
            <p>Codice UNICO: {codiceUnico}</p>
            <p>Ragione sociale: {ragioneSociale}</p>
          </>
        )}
      </div>
    </div>
  );
}

