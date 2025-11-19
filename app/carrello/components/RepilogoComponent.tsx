import clsx from "clsx";

import InputSconto from "./InputSconto";
import { useCheckoutStore } from "@/store/checkout-store";
import { redirect } from "next/navigation";

export default function RepilogoComponent({
  totalPrice,
  basket,
}: {
  totalPrice: number;
  basket: { id: string; qnt: number }[];
}) {
  const { setCheckoutData, setStep, step } = useCheckoutStore();

  const handleProceedToOrder = () => {
    if (basket.length === 0) {
      alert("Il carrello è vuoto");
      return;
    }
    setStep(1);
    setCheckoutData({ totalPrice, basket });
    redirect("/checkout");
  };

  return (
    <div className="w-full xl:max-w-[426px]">
      <div className="sticky top-5 flex w-full flex-col gap-6 rounded-sm bg-background p-3">
        <h3 className="H4M">Riepilogo Ordine</h3>
        <ul className="flex flex-col gap-3">
          {[
            { title: "articolo (li)", price: totalPrice },
            { title: "IVA (inclusa)", price: 2 },
            { title: "Spedizione", price: 0 },
          ].map((i, index) => (
            <li key={index} className="flex items-center justify-between">
              <span className="text_R">
                <span className={clsx(index !== 0 && "hidden")}>
                  {" "}
                  {basket.reduce((acc, item) => {
                    return acc + item.qnt;
                  }, 0)}
                </span>{" "}
                {i.title}
              </span>
              <span className="input_R_18">{i.price.toFixed(2)} €</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between">
          <h4 className="H3">Totale</h4>
          <span className="H4M">{totalPrice.toFixed(2)} €</span>
        </div>
        <InputSconto />
        {step === 0 && (
          <button
            type="button"
            onClick={handleProceedToOrder}
            className="btn rounded-sm bg-yellow-500 p-3 text-black"
          >
            Procedi all’ordine
          </button>
        )}
      </div>
    </div>
  );
}
