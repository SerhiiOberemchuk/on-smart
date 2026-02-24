"use client";

import icon_delivery_success from "@/assets/icons/icon_delivery_success.svg";
import icon_pencil from "@/assets/icons/icon_add_review.svg";
import Image from "next/image";
import Link from "next/link";
import {
  CheckoutTypesDataFirstStep,
  CheckoutTypesDataStepConsegna,
  useCheckoutStore,
} from "@/store/checkout-store";

export default function RiepilogoDatiConsegna({
  isModifica = true,
  externalDataConsegna,
  externalDataCustomer,
}: {
  isModifica?: boolean;
  externalDataConsegna?: CheckoutTypesDataStepConsegna;
  externalDataCustomer?: CheckoutTypesDataFirstStep;
}) {
  const { dataFirstStep, dataCheckoutStepConsegna } = useCheckoutStore();
  const dataCheckoutStepConsegnaFinal = externalDataConsegna || dataCheckoutStepConsegna;
  const dataFirstStepFinal = externalDataCustomer || dataFirstStep;
  const {
    numeroTelefono,
    email,
    nome,
    indirizzo,
    citta,
    cap,
    provinciaRegione,
    numeroCivico,
    cognome,
    referenteContatto,
    deliveryMethod,
  } = dataFirstStepFinal;

  const { sameAsBilling, deliveryAdress } = dataCheckoutStepConsegnaFinal;
  return (
    <div>
      <div className="flex items-center gap-2">
        <Image
          src={icon_delivery_success}
          alt="icon email confirmed"
          aria-label="icon email confirmed"
        />
        <h3 className="H5">Metodo di consegna</h3>
        {isModifica && (
          <Link
            href="/checkout/consegna"
            className="ml-auto flex shrink-0 items-center gap-1 underline hover:text-yellow-600"
          >
            <Image src={icon_pencil} alt="icon pencil" aria-label="icon pencil" /> Modifica
          </Link>
        )}
      </div>

      <div className="text_R mt-3 pl-8 text-text-grey">
        {deliveryMethod === "CONSEGNA_CORRIERE" && <p>Corriere</p>}
        {deliveryMethod === "RITIRO_NEGOZIO" && <p>Ritiro presso il magazzino di Avellino</p>}
        {deliveryMethod === "CONSEGNA_CORRIERE" && dataFirstStep.clientType === "azienda" && (
          <>
            {sameAsBilling ? (
              <>
                <p>{numeroTelefono}</p>
                <p>{email}</p>
                <p>{nome}</p>
                <p>{cognome}</p>
                <p>{referenteContatto}</p>
                <p>{cap}</p>
                <p>
                  {indirizzo}, {numeroCivico}
                </p>
                <p>
                  {citta}, {provinciaRegione}
                </p>
              </>
            ) : (
              <>
                <p>{numeroTelefono}</p>
                <p>{email}</p>
                <p>{deliveryAdress?.referente_contatto}</p>
                <p>{deliveryAdress?.cap}</p>
                <p>{deliveryAdress?.indirizzo}</p>
                <p>
                  {deliveryAdress?.citta}, {deliveryAdress?.provincia_regione}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
