"use client";

import icon_delivery_success from "@/assets/icons/icon_delivery_success.svg";
import icon_pencil from "@/assets/icons/icon_add_review.svg";
import Image from "next/image";
import Link from "next/link";
import { useCheckoutStore } from "@/store/checkout-store";
import { InputsCheckoutStep1, InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";

export default function RiepilogoDatiConsegna({
  isModifica = true,
  externalDataConsegna,
  externalDataCustomer,
}: {
  isModifica?: boolean;
  externalDataConsegna?: Partial<InputsCheckoutStep2Consegna>;
  externalDataCustomer?: Partial<InputsCheckoutStep1>;
}) {
  const { dataFirstStep, dataCheckoutStepConsegna } = useCheckoutStore();
  const dataCheckoutStepConsegnaFinal = externalDataConsegna || dataCheckoutStepConsegna;
  const dataFirstStepFinal = externalDataCustomer || dataFirstStep;
  const {
    numeroTelefono,
    email,
    nome,
    indirizzo,
    città,
    cap,
    provincia_regione,
    numero_civico,
    cognome,
    referente_contatto,
  } = dataFirstStepFinal;

  const {
    deliveryMethod,
    sameAsBilling,
    cap: capConsegna,
    città: cittàConsegna,
    indirizzo: indirizzoConsegna,
    // ragione_sociale: ragione_socialeConsegna,
    referente_contatto: referente_consegna,
    provincia_regione: provincia_regioneConsegna,
  } = dataCheckoutStepConsegnaFinal;
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
        {deliveryMethod === "consegna_corriere" && <p>Corriere</p>}
        {deliveryMethod === "ritiro_negozio" && <p>Ritiro presso il magazzino di Avellino</p>}
        {deliveryMethod === "consegna_corriere" && dataFirstStep.client_type === "azienda" && (
          <>
            {sameAsBilling ? (
              <>
                <p>{numeroTelefono}</p>
                <p>{email}</p>
                <p>{nome}</p>
                <p>{cognome}</p>
                <p>{referente_contatto}</p>
                <p>{cap}</p>
                <p>
                  {indirizzo}, {numero_civico}
                </p>
                <p>
                  {città}, {provincia_regione}
                </p>
              </>
            ) : (
              <>
                <p>{numeroTelefono}</p>
                <p>{email}</p>
                <p>{referente_consegna}</p>
                <p>{capConsegna}</p>
                <p>{indirizzoConsegna}</p>
                <p>
                  {cittàConsegna}, {provincia_regioneConsegna}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
