import icon_email_confirmed from "@/assets/icons/icon_email_confirm.svg";
import icon_pencil from "@/assets/icons/icon_add_review.svg";
import Image from "next/image";
import Link from "next/link";
import { useCheckoutStore } from "@/store/checkout-store";

export default function RiepilogoDatiCliente() {
  const { dataFirstStep } = useCheckoutStore();
  const { numeroTelefono, email, nome, indirizzo, città, cap, provincia_regione } = dataFirstStep;
  return (
    <div>
      <div className="flex items-center gap-2">
        <Image
          src={icon_email_confirmed}
          alt="icon email confirmed"
          aria-label="icon email confirmed"
        />
        <h3 className="H5">I tuoi dati</h3>
        <Link
          href="/checkout"
          className="ml-auto flex shrink-0 items-center gap-1 underline hover:text-yellow-600"
        >
          <Image src={icon_pencil} alt="icon pencil" aria-label="icon pencil" /> Modifica
        </Link>
      </div>
      <div className="text_R mt-3 pl-8 text-text-grey">
        <p className="">{numeroTelefono}</p>
        <p className="">{email}</p>
        <p className="">{nome}</p>
        <p className="">{cap}</p>
        <p className="">{indirizzo}</p>
        <p>
          {città}, {provincia_regione}
        </p>
      </div>
    </div>
  );
}
