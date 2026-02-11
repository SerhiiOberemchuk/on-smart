"use client";
import clsx from "clsx";

// import InputSconto from "./InputSconto";
import { useCheckoutStore } from "@/store/checkout-store";
import { redirect, usePathname } from "next/navigation";
import ButtonYellow from "@/components/BattonYellow";
import { PAGES } from "@/types/pages.types";
import { getDeliveryPrice, getIvaValue, getTotalPriceToPay } from "@/utils/get-prices";

export default function RepilogoComponent({
  totalPrice,
  basket,
  // isInputSconto = false,
}: {
  totalPrice: number;
  basket: { id: string; qnt: number }[];
  isInputSconto?: boolean;
}) {
  const { setCheckoutData, setStep, step } = useCheckoutStore();
  const path = usePathname();
  const handleProceedToOrder = () => {
    if (basket.length === 0) {
      alert("Il carrello è vuoto");
      return;
    }
    if (!step) {
      setStep(1);
    }
    setCheckoutData({ totalPrice, basket });

    redirect(PAGES.CHECKOUT_PAGES.INFORMATION);
  };

  return (
    <div className="sticky top-5 w-full xl:max-w-[426px]">
      <div className="sticky top-5 flex w-full flex-col gap-6 rounded-sm bg-background p-3">
        <h3 className="H4M">Riepilogo Ordine</h3>
        <ul className="flex flex-col gap-3">
          {[
            { title: "articolo (li)", price: totalPrice },
            { title: "IVA (inclusa)", price: getIvaValue(totalPrice) },
            {
              title: "Spedizione",
              price: getDeliveryPrice(totalPrice),
            },
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
          <span className="H4M">{getTotalPriceToPay(totalPrice).toFixed(2)} €</span>
        </div>
        {/* {isInputSconto && totalPrice > 0 && <InputSconto />} */}
        {path === "/carrello" && (
          <ButtonYellow
            type="button"
            disabled={basket.length === 0}
            onClick={handleProceedToOrder}
            // className="btn rounded-sm bg-yellow-500 p-3 text-black"
          >
            Procedi all’ordine
          </ButtonYellow>
        )}
      </div>
    </div>
  );
}
