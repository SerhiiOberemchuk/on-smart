"use client";

import icon_delivery from "@/assets/icons/icon_delivery.svg";
import Image from "next/image";
import { InputBlock } from "@/components/InputBloc";
import { SubmitHandler, useForm } from "react-hook-form";
import ButtonYellow from "@/components/BattonYellow";
import { CheckoutTypesDataStepConsegna, useCheckoutStore } from "@/store/checkout-store";
import { useRouter } from "next/navigation";
import RiepilogoDatiCliente from "./RiepilogoDatiCliente";
import { DELIVERY_METHOD_CONSTANT } from "@/types/orders.types";
import { useEffect } from "react";
import { getDeliveryPrice } from "@/utils/get-prices";

const NAME_RADIO_BUTTON_METOD = "deliveryMethod";

export default function CheckouteStep2ConsegnaDati() {
  const {
    dataCheckoutStepConsegna,
    setDataCheckoutStepConsegna,
    setStep,
    setDelyveryPrice,
    dataFirstStep,
    setDeliveryMethod,
    setSameAsBilling,
    totalPrice,
  } = useCheckoutStore();

  const sameAsBilling =
    dataCheckoutStepConsegna.sameAsBilling ?? dataFirstStep.clientType === "privato";
  const { register, handleSubmit } = useForm<CheckoutTypesDataStepConsegna>({
    defaultValues: dataCheckoutStepConsegna,
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<CheckoutTypesDataStepConsegna> = (data) => {
    let cleaned: CheckoutTypesDataStepConsegna["deliveryAdress"];
    if (dataFirstStep.deliveryMethod === "RITIRO_NEGOZIO") {
      setDataCheckoutStepConsegna({
        sameAsBilling,
        deliveryAdress: null,
      });
      setStep(3);
      router.push("/checkout/pagamento");
      return;
    }

    if (sameAsBilling === true) {
      cleaned = null;
    } else {
      cleaned = {
        referente_contatto: data?.deliveryAdress?.referente_contatto ?? "",
        ragione_sociale: data?.deliveryAdress?.ragione_sociale ?? "",
        partita_iva: data?.deliveryAdress?.partita_iva ?? "",
        indirizzo: data?.deliveryAdress?.indirizzo ?? "",
        citta: data?.deliveryAdress?.citta ?? "",
        cap: data?.deliveryAdress?.cap ?? "",
        nazione: data?.deliveryAdress?.nazione ?? "",
        provincia_regione: data?.deliveryAdress?.provincia_regione ?? "",
      };
    }

    setDataCheckoutStepConsegna({
      deliveryAdress: cleaned,
      sameAsBilling,
    });
    setStep(3);
    router.push("/checkout/pagamento");
  };
  useEffect(() => {
    (() => {
      setDelyveryPrice({
        deliveryPrice:
          dataFirstStep.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : getDeliveryPrice(totalPrice),
      });
    })();
  }, [setDelyveryPrice, dataFirstStep.deliveryPrice, dataFirstStep.deliveryMethod, totalPrice]);

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
              value={DELIVERY_METHOD_CONSTANT.CONSEGNA_CORRIERE}
              required
              id="deliveryMethodCorriere"
              checked={dataFirstStep.deliveryMethod === DELIVERY_METHOD_CONSTANT.CONSEGNA_CORRIERE}
              onChange={() => {
                setDeliveryMethod(DELIVERY_METHOD_CONSTANT.CONSEGNA_CORRIERE);
              }}
            />
            Consegna a domicilio tramite corriere
          </label>
          <span className="helper_text text-grey">
            {getDeliveryPrice(totalPrice)
              ? `${getDeliveryPrice(totalPrice).toFixed(2)} €`
              : "Gratis"}
          </span>
        </div>
        {dataFirstStep.deliveryMethod === "CONSEGNA_CORRIERE" &&
          dataFirstStep.clientType === "azienda" && (
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
                    {...register("deliveryAdress.referente_contatto")}
                    type="text"
                    className="helper_text"
                  />
                  <div className="flex flex-wrap gap-3">
                    <InputBlock
                      {...register("deliveryAdress.ragione_sociale")}
                      title="Ragione sociale*"
                      required
                      className="helper_text min-w-60 flex-1"
                      type="text"
                    />
                    <InputBlock
                      {...register("deliveryAdress.partita_iva")}
                      title="Partita IVA*"
                      required
                      minLength={11}
                      maxLength={11}
                      type="text"
                      className="helper_text min-w-60 flex-1"
                    />
                  </div>
                  <InputBlock
                    {...register("deliveryAdress.indirizzo")}
                    title="Indirizzo / Sede legale*"
                    required
                    type="text"
                    className="helper_text min-w-60 flex-1"
                  />
                  <div className="flex flex-wrap gap-3">
                    <InputBlock
                      {...register("deliveryAdress.citta")}
                      title="Città*"
                      required
                      className="helper_text min-w-60 flex-1"
                      type="text"
                    />
                    <InputBlock
                      {...register("deliveryAdress.cap")}
                      title="CAP*"
                      required
                      type="text"
                      className="helper_text min-w-60 flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <InputBlock
                      {...register("deliveryAdress.nazione")}
                      title="Nazione*"
                      required
                      className="helper_text min-w-60 flex-1"
                      type="text"
                    />
                    <InputBlock
                      {...register("deliveryAdress.provincia_regione")}
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
              value={DELIVERY_METHOD_CONSTANT.RITIRO_NEGOZIO}
              id="deliveryMethodNegozio"
              checked={dataFirstStep.deliveryMethod === DELIVERY_METHOD_CONSTANT.RITIRO_NEGOZIO}
              onChange={() => {
                setDeliveryMethod(DELIVERY_METHOD_CONSTANT.RITIRO_NEGOZIO);
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
