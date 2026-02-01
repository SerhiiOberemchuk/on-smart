"use client";

import icon_card_success from "@/assets/icons/icon_card_success.svg";
import icon_pencil from "@/assets/icons/icon_add_review.svg";
import Image from "next/image";
import Link from "next/link";
import { useCheckoutStore } from "@/store/checkout-store";
import BonificoDati from "./BonificoDati";
import { MetodsPayment } from "@/types/bonifico.data";
import { PAGES } from "@/types/pages.types";

export default function RiepilogoDatiPagamento({
  isModifica = true,
  externalDataPayment,
}: {
  isModifica?: boolean;
  externalDataPayment?: Partial<MetodsPayment>;
}) {
  const { dataCheckoutStepPagamento } = useCheckoutStore();

  const dataCheckoutStepPagamentoFinal = externalDataPayment || dataCheckoutStepPagamento;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Image
          src={icon_card_success}
          alt="icon email confirmed"
          aria-label="icon email confirmed"
        />
        <h3 className="H5">Metodo di pagamento</h3>
        {isModifica && (
          <Link
            href={PAGES.CHECKOUT_PAGES.PAYMENT}
            className="ml-auto flex shrink-0 items-center gap-1 underline hover:text-yellow-600"
          >
            <Image src={icon_pencil} alt="icon pencil" aria-label="icon pencil" /> Modifica
          </Link>
        )}
      </div>

      <div className="text_R mt-3">
        {dataCheckoutStepPagamentoFinal?.paymentMethod === "bonifico" ? (
          <BonificoDati />
        ) : (
          <p className="pl-8 text-text-grey">{dataCheckoutStepPagamentoFinal?.title}</p>
        )}
      </div>
    </div>
  );
}
