import Image from "next/image";
import icon_email from "@/assets/icons/icon_email.svg";
import { twMerge } from "tailwind-merge";
import { useForm, SubmitHandler } from "react-hook-form";

import ButtonYellow from "@/components/BattonYellow";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckoutTypesDataFirstStep, useCheckoutStore } from "@/store/checkout-store";
import { useRouter } from "next/navigation";
import { InputBlock } from "@/components/InputBloc";

export default function CheckouteStep1FormClientData() {
  const {
    setDataFirstStepCheckout,
    setStep,
    dataFirstStep,
    resetRequestCodiceFiscale,
    switchRequestInvoce,
  } = useCheckoutStore();

  const { register, handleSubmit, resetField, watch } = useForm<CheckoutTypesDataFirstStep>({
    defaultValues: dataFirstStep,
  });
  const router = useRouter();
  const [clientType, setClientType] = useState<CheckoutTypesDataFirstStep["clientType"]>(
    dataFirstStep?.clientType || "privato",
  );

  useEffect(() => {
    if (clientType === "privato") {
      resetField("ragioneSociale");
      resetField("partitaIva");
      resetField("referenteContatto");
    }

    if (clientType === "azienda") {
      resetField("nome");
      resetField("cognome");
      resetField("codiceFiscale");
      resetField("requestInvoice");
    }
  }, [clientType, resetField]);

  const onSubmit: SubmitHandler<CheckoutTypesDataFirstStep> = (data) => {
    setDataFirstStepCheckout(data);
    setStep(2);
    router.push("/checkout/consegna");
  };
  const pec = watch("pecAzzienda");
  const codice = watch("codiceUnico");
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <h2 className="H5 flex gap-2">
          <Image src={icon_email} alt="I tuoi dati" />
          <span>I tuoi dati</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="input_R_18">Ordini come:</h3>
          <fieldset className="flex">
            <label className="text_R mr-4 flex shrink-0 items-center gap-2 hover:text-yellow-600">
              <input
                type="radio"
                {...register("clientType")}
                onChange={() => {
                  setClientType("privato");
                }}
                required
                checked={clientType === "privato"}
                value="privato"
              />
              Privato
            </label>
            <label className="body_R_2 flex shrink-0 items-center gap-2 hover:text-yellow-600">
              <input
                type="radio"
                {...register("clientType")}
                onChange={() => {
                  setClientType("azienda");
                }}
                required
                checked={clientType === "azienda"}
                value="azienda"
              />
              Azienda
            </label>
          </fieldset>
        </div>
        <div className="flex flex-wrap gap-3">
          <InputBlock
            title="Indirizzo email *"
            type="email"
            {...register("email")}
            required
            className="min-w-[200px] flex-1"
          />
          <InputBlock
            title="Numero di Telefono*"
            {...register("numeroTelefono")}
            required
            type="tel"
            className="min-w-[200px] flex-1"
          />
        </div>
        {clientType === "privato" && (
          <div className="flex flex-wrap gap-3">
            <InputBlock
              title="Nome *"
              {...register("nome")}
              required
              type="text"
              className="min-w-[200px] flex-1"
            />
            <InputBlock
              title="Cognome *"
              {...register("cognome")}
              required
              type="text"
              className="min-w-[200px] flex-1"
            />
          </div>
        )}

        {clientType === "azienda" && (
          <InputBlock
            title="Referente / Contatto*"
            {...register("referenteContatto")}
            required
            type="text"
            className="min-w-[200px] flex-1"
          />
        )}

        {clientType === "azienda" && (
          <>
            <div className="flex flex-wrap gap-3">
              <InputBlock
                title="Ragione sociale*"
                {...register("ragioneSociale")}
                required
                type="text"
                className="min-w-[200px] flex-1"
              />
              <InputBlock
                title="Partita IVA*"
                {...register("partitaIva")}
                required
                minLength={11}
                maxLength={11}
                type="text"
                className="min-w-[200px] flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <InputBlock
                title={!codice ? "PEC *" : "PEC "}
                {...register("pecAzzienda")}
                required={!codice}
                type="text"
                className="min-w-[200px] flex-1"
              />
              <InputBlock
                title={!pec ? "Codice UNIVOCO *" : "Codice UNIVOCO"}
                {...register("codiceUnico")}
                required={!pec}
                minLength={7}
                maxLength={7}
                type="text"
                className="min-w-[200px] flex-1"
              />
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-3">
          <InputBlock
            title="Indirizzo *"
            {...register("indirizzo")}
            required
            type="text"
            className="min-w-[200px] flex-1"
          />
          <InputBlock
            title="Numero civico *"
            {...register("numeroCivico")}
            required
            type="text"
            className="min-w-[200px] flex-1"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <InputBlock
            title="Città *"
            {...register("citta")}
            required
            type="text"
            className="min-w-[200px] flex-1"
          />
          <InputBlock
            title="CAP *"
            {...register("cap")}
            required
            type="text"
            className="min-w-[200px] flex-1"
          />{" "}
        </div>
        <div className="flex flex-wrap gap-3">
          <InputBlock
            title="Nazione *"
            {...register("nazione")}
            required
            type="text"
            className="min-w-[200px] flex-1"
          />
          <InputBlock
            title="Provincia / Regione *"
            {...register("provinciaRegione")}
            required
            type="text"
            className="min-w-[200px] flex-1"
          />
        </div>

        <p className="fixel_display text-text-grey">
          Proseguendo, confermo di aver letto e compreso i{" "}
          <Link href="/informativa-sulla-privacy" className="underline">
            Termini e condizioni
          </Link>{" "}
          e{" "}
          <Link href="/informativa-sulla-privacy" className="underline">
            l’Informativa sulla privacy
          </Link>
          , e acconsento a ricevere notizie e offerte esclusive.
        </p>
        {clientType === "privato" && (
          <>
            <label
              htmlFor="request_invoice"
              className="fixel_display flex items-center gap-2 text-xl text-yellow-600"
            >
              <input
                type="checkbox"
                {...register("requestInvoice")}
                id="request_invoice"
                checked={dataFirstStep?.requestInvoice ? true : false}
                onChange={() => {
                  switchRequestInvoce();
                  if (dataFirstStep.requestInvoice === true) {
                    resetField("codiceFiscale");
                    resetRequestCodiceFiscale();
                  }
                }}
              />
              Richiedi Fattura
            </label>

            <div
              className={twMerge(
                "transition-max-height overflow-hidden duration-300 ease-in-out",
                dataFirstStep.requestInvoice ? "max-h-20" : "max-h-0",
              )}
            >
              {dataFirstStep.requestInvoice && (
                <InputBlock
                  title="Codice Fiscale *"
                  required={dataFirstStep.requestInvoice}
                  minLength={16}
                  maxLength={16}
                  {...register("codiceFiscale")}
                  type="text"
                  className=""
                />
              )}
            </div>
          </>
        )}
        <ButtonYellow type="submit" className="ml-auto">
          Vai avanti
        </ButtonYellow>
      </form>
    </>
  );
}
