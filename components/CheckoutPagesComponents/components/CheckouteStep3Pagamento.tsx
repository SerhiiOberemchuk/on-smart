import Image from "next/image";

import icon_card from "@/assets/icons/icon_card.svg";
import { InputBlock } from "@/components/InputBloc";
import { useState } from "react";
import ButtonYellow from "@/components/BattonYellow";
import { MetodsPayment, PAYMENT_METHODS } from "@/types/bonifico.data";
import { useCheckoutStore } from "@/store/checkout-store";
import { redirect } from "next/navigation";
import BonificoDati from "./BonificoDati";
import RiepilogoDatiCliente from "./RiepilogoDatiCliente";
import RiepilogoDatiConsegna from "./RepilogoDatiConsegna";

export default function CheckouteStep3Pagamento() {
  const { setDataCheckoutStepPagamento, setStep, dataCheckoutStepPagamento } = useCheckoutStore();
  // const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<MetodsPayment["paymentMethod"] | undefined>(
    dataCheckoutStepPagamento?.paymentMethod,
  );
  const handleSubmit = () => {
    if (!paymentMethod) return;
    // setIsButtonDisabled(true);
    setDataCheckoutStepPagamento(PAYMENT_METHODS.find((m) => m.paymentMethod === paymentMethod)!);
    setStep(4);
    redirect("/checkout/riepilogo");
  };

  return (
    <div className="flex flex-col gap-6">
      <RiepilogoDatiCliente />
      <RiepilogoDatiConsegna />
      <div>
        <div className="flex items-center gap-2">
          <Image src={icon_card} alt="icon banca " aria-label="icon banca " />
          <h3 className="H5">Scegli il metodo di pagamento</h3>
        </div>
        <ul className="mt-3 pl-8">
          {PAYMENT_METHODS.map((method, index) => (
            <li key={index}>
              <InputBlock
                type="radio"
                name="paymentMethod"
                title={method.title}
                value={method.paymentMethod}
                required
                checked={method.paymentMethod === paymentMethod}
                className="flex flex-row-reverse justify-end gap-3 py-2"
                onChange={() => setPaymentMethod(method.paymentMethod)}
              />
            </li>
          ))}
        </ul>
        {paymentMethod === "bonifico" && <BonificoDati />}
      </div>
      <ButtonYellow
        className="ml-auto"
        disabled={!paymentMethod
          //  || isButtonDisabled
          }
        type="button"
        onClick={handleSubmit}
      >
        Vai avanti
      </ButtonYellow>
    </div>
  );
}
