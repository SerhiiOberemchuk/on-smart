"use client";

import RepilogoComponent from "@/app/(client)/carrello/components/RepilogoComponent";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useCheckoutStore } from "@/store/checkout-store";
import { useEffect, useState } from "react";
import { PAGES } from "@/types/pages.types";

export default function LayoutRepilogoComponent({ className }: { className?: string }) {
  const pathName = usePathname();
  const isCompletatoPage = pathName === PAGES.CHECKOUT_PAGES.COMPLETED;

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
  if (isCompletatoPage) return null;
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
