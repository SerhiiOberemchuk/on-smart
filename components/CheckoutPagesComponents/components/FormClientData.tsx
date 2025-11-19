import Image from "next/image";
import icon_email from "@/assets/icons/icon_email.svg";
import { twMerge } from "tailwind-merge";

export default function FormClientData() {
  return (
    <form className="flex flex-col gap-3">
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
              name="client_type"
              required
              value="individual"
              className="input_radio_round"
            />
            Persona fisica
          </label>
          <label className="body_R_2 flex shrink-0 items-center gap-2 hover:text-yellow-600">
            <input
              type="radio"
              name="client_type"
              required
              value="business"
              className="input_radio_round"
            />
            Azienda
          </label>
        </fieldset>
      </div>
      <div className="flex flex-wrap gap-3">
        <InputBlock
          title="Indirizzo email*"
          type="email"
          required
          className="min-w-[200px] flex-1"
        />
        <InputBlock title="NumeroTelefono*" required type="tel" className="min-w-[200px] flex-1" />
      </div>
      <div className="flex flex-wrap gap-3">
        <InputBlock title="Nome*" required type="text" className="min-w-[200px] flex-1" />
        <InputBlock title="Cognome*" required type="text" className="min-w-[200px] flex-1" />
      </div>

      <InputBlock title="Indirizzo*" required type="text" className="min-w-[200px] flex-1" />
      <div className="flex flex-wrap gap-3">
        <InputBlock title="Città*" required type="text" className="min-w-[200px] flex-1" />
        <InputBlock title="CAP*" required type="text" className="min-w-[200px] flex-1" />{" "}
      </div>
      <div className="flex flex-wrap gap-3">
        <InputBlock title="Provincia*" required type="text" className="min-w-[200px] flex-1" />
        <InputBlock title="Regione*" required type="text" className="min-w-[200px] flex-1" />{" "}
      </div>

      <p className="text-text-grey">
        Proseguendo, confermo di aver letto e compreso i Termini e condizioni e l’Informativa sulla
        privacy, e acconsento a ricevere notizie e offerte esclusive.
      </p>
    </form>
  );
}

function InputBlock({
  title,
  className,
  ...rest
}: { title: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={twMerge("helper_text flex flex-col gap-1", className)}>
      {title}
      <input name={title} {...rest} className="border-b border-stroke-grey outline-0" />
    </label>
  );
}
