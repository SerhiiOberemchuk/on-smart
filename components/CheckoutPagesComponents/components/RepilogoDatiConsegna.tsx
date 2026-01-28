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

  const { numeroTelefono, email, nome, indirizzo, città, cap, provincia_regione } =
    dataFirstStepFinal;

  const {
    deliveryMethod,
    sameAsBilling,
    cap: capConsegna,
    città: cittàConsegna,
    indirizzo: indirizzoConsegna,
    // ragione_sociale: ragione_socialeConsegna,
    referente_contatto,
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
        {deliveryMethod === "ritiro_negozio" && <p>Ritiro in negozio</p>}
        {deliveryMethod === "consegna_corriere" && (
          <>
            {sameAsBilling ? (
              <>
                <p className="">{numeroTelefono}</p>
                <p className="">{email}</p>
                <p className="">{nome}</p>
                <p className="">{cap}</p>
                <p className="">{indirizzo}</p>
                <p>
                  {città}, {provincia_regione}
                </p>
              </>
            ) : (
              <>
                <p className="">{numeroTelefono}</p>
                <p className="">{email}</p>
                <p className="">{referente_contatto}</p>
                <p className="">{capConsegna}</p>
                <p className="">{indirizzoConsegna}</p>
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
