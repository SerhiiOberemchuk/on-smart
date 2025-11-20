import Image from "next/image";
import RiepilogoDatiCliente from "./RepilogoDatiCliente";
import RiepilogoDatiConsegna from "./RepilogoDatiConsegna";
import icon_card from "@/assets/icons/icon_card.svg";
import { InputBlock } from "@/components/InputBloc";
import { useState } from "react";
import ButtonYellow from "@/components/BattonYellow";

const paymentMethods: MetodsPayment[] = [
  {
    title: "Pagamento con carta",
    value: "card",
  },
  {
    title: "PayPal",
    value: "paypal",
  },
  {
    title: "Bonifico bancario online",
    value: "bank_transfer",
  },
  {
    title: "Klarna",
    value: "klarna",
  },
];

type MetodsPayment = { title: string; value: "card" | "paypal" | "bank_transfer" | "klarna" };

export default function CheckouteStep3Pagamento() {
  const [paymentMethod, setPaymentMethod] = useState<MetodsPayment["value"]>();
  return (
    <div className="flex flex-col gap-6">
      <RiepilogoDatiCliente />
      <RiepilogoDatiConsegna />
      <div>
        <div className="flex items-center gap-2">
          <Image src={icon_card} alt="icon banca " aria-label="icon banca " />
          <h3 className="H5">Scegli il metodo di pagamento</h3>
        </div>
        <ul className="mt-3">
          {paymentMethods.map((method, index) => (
            <li key={index}>
              <InputBlock
                type="radio"
                name="paymentMethod"
                title={method.title}
                value={method.value}
                required
                checked={method.value === paymentMethod}
                className="flex flex-row-reverse justify-end gap-3 px-2 py-2"
                onChange={() => setPaymentMethod(method.value)}
              />
            </li>
          ))}
        </ul>
      </div>
      <ButtonYellow className="ml-auto" type="submit">
        Vai avanti
      </ButtonYellow>
    </div>
  );
}
