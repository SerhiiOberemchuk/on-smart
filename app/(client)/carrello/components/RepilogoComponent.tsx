"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import ButtonYellow from "@/components/BattonYellow";
import type {
  BasketTypeUseCheckoutStore,
  TotalPriseTypeuseCheckoutStore,
} from "@/types/checkout-flow.types";
import { DELIVERY_DATA } from "@/types/delivery.data";
import { getIvaValue, getTotalPriceToPay } from "@/utils/get-prices";

export default function RepilogoComponent({
  totalPrice,
  basket,
}: {
  totalPrice: TotalPriseTypeuseCheckoutStore;
  basket: BasketTypeUseCheckoutStore;
  isInputSconto?: boolean;
}) {
  const router = useRouter();

  const shippingEstimate =
    totalPrice > DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE ? 0 : DELIVERY_DATA.PRISE_DELIVERY;
  const total = getTotalPriceToPay({ totalPrice });

  const handleProceedToOrder = () => {
    if (basket.length === 0) {
      toast.warn("Il carrello è vuoto");
      return;
    }
    // The /checkout page routes by session (account checkout vs guest registration).
    router.push("/checkout");
  };

  return (
    <div className="sticky top-5 w-full xl:max-w-[426px]">
      <div className="sticky top-5 flex w-full flex-col gap-6 rounded-sm bg-background p-3">
        <h3 className="H4M">Riepilogo Ordine</h3>
        <ul className="flex flex-col gap-3">
          {[
            { title: "articolo (li)", price: totalPrice },
            { title: "IVA (inclusa)", price: getIvaValue(totalPrice) },
            { title: "Spedizione", price: shippingEstimate },
          ].map((item, index) => (
            <li key={index} className="flex items-center justify-between">
              <span className="text_R">
                <span className={index !== 0 ? "hidden" : undefined}>
                  {" "}
                  {basket.reduce((acc, basketItem) => acc + basketItem.quantity, 0)}
                </span>{" "}
                {item.title}
              </span>
              <span className="input_R_18">{item.price.toFixed(2)} €</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between">
          <h4 className="H3 mr-1">Totale</h4>
          <span className="H4M">{total.toFixed(2)} €</span>
        </div>

        <ButtonYellow type="button" disabled={basket.length === 0} onClick={handleProceedToOrder}>
          Procedi all&apos;ordine
        </ButtonYellow>
      </div>
    </div>
  );
}
