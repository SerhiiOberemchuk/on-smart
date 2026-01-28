"use client";

import RepilogoComponent from "@/app/(client)/carrello/components/RepilogoComponent";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useCheckoutStore } from "@/store/checkout-store";
import { useEffect, useState } from "react";

export default function LayoutRepilogoComponent({ className }: { className?: string }) {
  const pathName = usePathname();
  const isCompletatoPage = pathName === "/checkout/completato";

  const { totalPrice, basket, orderNumber } = useCheckoutStore();

  const [frozenData, setFrozenData] = useState<{
    totalPrice: number;
    basket: { id: string; qnt: number }[];
  } | null>(null);

  useEffect(() => {
    if (isCompletatoPage && orderNumber && totalPrice && basket && basket.length > 0) {
      const set = () =>
        setFrozenData({
          totalPrice: totalPrice,
          basket: [...basket],
        });
      set();
    }
  }, [isCompletatoPage, orderNumber, totalPrice, basket]);

  const displayTotal = isCompletatoPage && !totalPrice ? frozenData?.totalPrice : totalPrice;
  const displayBasket = isCompletatoPage && basket?.length === 0 ? frozenData?.basket : basket;

  return (
    <div className={twMerge(className)}>
      <RepilogoComponent
        totalPrice={displayTotal || 0}
        basket={displayBasket || []}
        isInputSconto={!isCompletatoPage}
      />
    </div>
  );
}
