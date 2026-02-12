"use client";

import icon_delivery from "@/assets/icons/icon_delivery.svg";
import Image from "next/image";
import { InputBlock } from "@/components/InputBloc";
import { SubmitHandler, useForm } from "react-hook-form";
import ButtonYellow from "@/components/BattonYellow";
import { DELIVERY_METHOD, InputsCheckoutStep2Consegna } from "@/types/checkout-steps.types";
import { useCheckoutStore } from "@/store/checkout-store";
import { useRouter } from "next/navigation";
import RiepilogoDatiCliente from "./RiepilogoDatiCliente";

const NAME_RADIO_BUTTON_METOD = "deliveryMethod";

export default function CheckouteStep2ConsegnaDati() {
  const {
    dataCheckoutStepConsegna,
    setDataCheckoutStepConsegna,
    clearSecondStepDataConsegna,
    setStep,
    priseDelivery,
    dataFirstStep,
    setDeliveryMethod,
    setSameAsBilling,
  } = useCheckoutStore();

  const sameAsBilling =
    dataCheckoutStepConsegna.sameAsBilling ?? dataFirstStep.client_type === "privato";
  const { register, handleSubmit } = useForm<InputsCheckoutStep2Consegna>({
    defaultValues: dataCheckoutStepConsegna,
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<InputsCheckoutStep2Consegna> = (data) => {
    let cleaned: Partial<InputsCheckoutStep2Consegna>;
    if (dataCheckoutStepConsegna.deliveryMethod === "ritiro_negozio") {
      setDataCheckoutStepConsegna({ deliveryMethod: "ritiro_negozio" });
      setStep(3);
      router.push("/checkout/pagamento");
      return;
    }

    if (sameAsBilling === true) {
      cleaned = {
        // sameAsBilling,
      };
      // clearSecondStepDataConsegna();
    } else {
      cleaned = {
        // sameAsBilling,
        referente_contatto: data.referente_contatto,
        ragione_sociale: data.ragione_sociale,
        partita_iva: data.partita_iva,
        indirizzo: data.indirizzo,
        città: data.città,
        cap: data.cap,
        nazione: data.nazione,
        provincia_regione: data.provincia_regione,
      };
    }

    setDataCheckoutStepConsegna(cleaned);
    setStep(3);
    router.push("/checkout/pagamento");
  };

  return (
    <div className="flex flex-col gap-6">
      <RiepilogoDatiCliente />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" id="form_consegna">
        <div className="flex items-center gap-2">
          <Image src={icon_delivery} alt="icon delivery" aria-label="icon delivery" />
          <legend className="H5">Scegli il metodo di consegna</legend>
        </div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="deliveryMethodCorriere"
            className="text_R flex min-h-12 items-center gap-3 pl-3 text-grey"
          >
            <input
              name={NAME_RADIO_BUTTON_METOD}
              type="radio"
              value={DELIVERY_METHOD.CORRIERE}
              required
              id="deliveryMethodCorriere"
              checked={dataCheckoutStepConsegna.deliveryMethod === DELIVERY_METHOD.CORRIERE}
              onChange={() => {
                setDeliveryMethod(DELIVERY_METHOD.CORRIERE);
              }}
            />
            Consegna a domicilio tramite corriere
          </label>
          <span className="helper_text text-grey">
            {priseDelivery ? `${priseDelivery.toFixed(2)} €` : "Gratis"}
          </span>
        </div>
        {dataCheckoutStepConsegna.deliveryMethod === "consegna_corriere" &&
          dataFirstStep.client_type === "azienda" && (
            <div>
              <label
                htmlFor="sameAsBilling"
                className="helper_XL flex items-center gap-2 pl-12 text-grey"
              >
                <input
                  {...register("sameAsBilling")}
                  type="checkbox"
                  checked={dataCheckoutStepConsegna.sameAsBilling}
                  onChange={() => setSameAsBilling(!dataCheckoutStepConsegna.sameAsBilling)}
                  id="sameAsBilling"
                />
                L’indirizzo di spedizione coincide con l’indirizzo di fatturazione
              </label>
              {!sameAsBilling && (
                <div className="flex flex-col gap-3 py-3 pl-12">
                  <InputBlock
                    title="Referente / Contatto*"
                    required
                    {...register("referente_contatto")}
                    type="text"
                    className="helper_text"
                  />
                  <div className="flex flex-wrap gap-3">
                    <InputBlock
                      {...register("ragione_sociale")}
                      title="Ragione sociale*"
                      required
                      className="helper_text min-w-60 flex-1"
                      type="text"
                    />
                    <InputBlock
                      {...register("partita_iva")}
                      title="Partita IVA*"
                      required
                      minLength={11}
                      maxLength={11}
                      type="text"
                      className="helper_text min-w-60 flex-1"
                    />
                  </div>
                  <InputBlock
                    {...register("indirizzo")}
                    title="Indirizzo / Sede legale*"
                    required
                    type="text"
                    className="helper_text min-w-60 flex-1"
                  />
                  <div className="flex flex-wrap gap-3">
                    <InputBlock
                      {...register("città")}
                      title="Città*"
                      required
                      className="helper_text min-w-60 flex-1"
                      type="text"
                    />
                    <InputBlock
                      {...register("cap")}
                      title="CAP*"
                      required
                      type="text"
                      className="helper_text min-w-60 flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <InputBlock
                      {...register("nazione")}
                      title="Nazione*"
                      required
                      className="helper_text min-w-60 flex-1"
                      type="text"
                    />
                    <InputBlock
                      {...register("provincia_regione")}
                      title="Provincia / Regione*"
                      required
                      type="text"
                      className="helper_text min-w-60 flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        <div className="flex items-center justify-between">
          <label
            htmlFor="deliveryMethodNegozio"
            className="text_R flex min-h-12 items-center gap-3 pl-3 text-grey"
          >
            <input
              name={NAME_RADIO_BUTTON_METOD}
              type="radio"
              required
              value={DELIVERY_METHOD.NEGOZIO}
              id="deliveryMethodNegozio"
              checked={dataCheckoutStepConsegna.deliveryMethod === DELIVERY_METHOD.NEGOZIO}
              onChange={() => {
                setDeliveryMethod(DELIVERY_METHOD.NEGOZIO);
              }}
            />
            Ritiro presso il magazzino di Avellino - su prenotazione
          </label>{" "}
          <span className="helper_text text-grey">Gratis</span>
        </div>
        <ButtonYellow className="ml-auto" type="submit">
          Vai avanti
        </ButtonYellow>
      </form>
    </div>
  );
}
