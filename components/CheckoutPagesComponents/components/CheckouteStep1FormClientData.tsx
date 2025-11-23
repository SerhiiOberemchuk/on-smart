import Image from "next/image";
import icon_email from "@/assets/icons/icon_email.svg";
import { twMerge } from "tailwind-merge";
import { useForm, SubmitHandler } from "react-hook-form";

import ButtonYellow from "@/components/BattonYellow";
import { useEffect, useState } from "react";
import Link from "next/link";
import { InputsCheckoutStep1 } from "@/types/checkout-steps.types";
import { useCheckoutStore } from "@/store/checkout-store";
import { useRouter } from "next/navigation";
import { InputBlock } from "@/components/InputBloc";

export default function CheckouteStep1FormClientData() {
  const { setDataFirstStepCheckout, setStep, dataFirstStep, resetRequestCodiceFiscale } =
    useCheckoutStore();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isCodiceFiscaleRequired, setIsCodiceFiscaleRequired] = useState(
    dataFirstStep?.request_invoice || false,
  );
  const { register, handleSubmit, resetField } = useForm<InputsCheckoutStep1>({
    defaultValues: dataFirstStep,
  });
  const router = useRouter();
  const [clientType, setClientType] = useState<InputsCheckoutStep1["client_type"]>(
    dataFirstStep?.client_type || "privato",
  );

  useEffect(() => {
    if (clientType === "privato") {
      resetField("ragione_sociale");
      resetField("partita_iva");
      resetField("referente_contatto");
    }

    if (clientType === "azienda") {
      resetField("nome");
      resetField("cognome");
      resetField("codice_fiscale");
      resetField("request_invoice");
    }
  }, [clientType, resetField]);

  const onSubmit: SubmitHandler<InputsCheckoutStep1> = (data) => {
    setIsButtonDisabled(true);
    let cleaned: Partial<InputsCheckoutStep1>;

    if (data.client_type === "privato") {
      cleaned = {
        client_type: "privato",
        email: data.email,
        numeroTelefono: data.numeroTelefono,
        nome: data.nome,
        cognome: data.cognome,
        indirizzo: data.indirizzo,
        città: data.città,
        cap: data.cap,
        nazione: data.nazione,
        provincia_regione: data.provincia_regione,
        request_invoice: !!data.request_invoice,
        codice_fiscale: data.request_invoice ? data.codice_fiscale : "",
      };
    } else {
      cleaned = {
        client_type: "azienda",
        email: data.email,
        numeroTelefono: data.numeroTelefono,
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

    setDataFirstStepCheckout(cleaned);
    setStep(2);
    router.push("/checkout/consegna");
  };
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
                {...register("client_type")}
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
                {...register("client_type")}
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
            {...register("referente_contatto")}
            required
            type="text"
            className="min-w-[200px] flex-1"
          />
        )}

        {clientType === "azienda" && (
          <div className="flex flex-wrap gap-3">
            <InputBlock
              title="Ragione sociale*"
              {...register("ragione_sociale")}
              required
              type="text"
              className="min-w-[200px] flex-1"
            />
            <InputBlock
              title="Partita IVA*"
              {...register("partita_iva")}
              required
              type="text"
              className="min-w-[200px] flex-1"
            />
          </div>
        )}
        <InputBlock
          title="Indirizzo *"
          {...register("indirizzo")}
          required
          type="text"
          className="min-w-[200px] flex-1"
        />
        <div className="flex flex-wrap gap-3">
          <InputBlock
            title="Città *"
            {...register("città")}
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
            {...register("provincia_regione")}
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
              className="fixel_display flex items-center gap-2 text-text-grey hover:text-yellow-600"
            >
              <input
                type="checkbox"
                {...register("request_invoice")}
                id="request_invoice"
                onChange={() => {
                  setIsCodiceFiscaleRequired((prev) => !prev);
                  if (isCodiceFiscaleRequired === true) {
                    resetField("codice_fiscale");
                    resetRequestCodiceFiscale();
                  }
                }}
              />
              Richiedi Fattura
            </label>

            <div
              className={twMerge(
                "transition-max-height overflow-hidden duration-300 ease-in-out",
                isCodiceFiscaleRequired ? "max-h-20" : "max-h-0",
              )}
            >
              {isCodiceFiscaleRequired && (
                <InputBlock
                  title="Codice Fiscale *"
                  required={isCodiceFiscaleRequired}
                  {...register("codice_fiscale")}
                  type="text"
                  className=""
                />
              )}
            </div>
          </>
        )}
        <ButtonYellow type="submit" disabled={isButtonDisabled} className="ml-auto">
          Vai avanti
        </ButtonYellow>
      </form>
    </>
  );
}
