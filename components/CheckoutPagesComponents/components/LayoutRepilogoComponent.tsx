"use client";

import RepilogoComponent from "@/app/(client)/carrello/components/RepilogoComponent";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useCheckoutStore } from "@/store/checkout-store";
import { PAGES } from "@/types/pages.types";

export default function LayoutRepilogoComponent({ className }: { className?: string }) {
  const pathName = usePathname();
  const isCompletatoPage = pathName.includes(PAGES.CHECKOUT_PAGES.COMPLETED);

  const { totalPrice, basket } = useCheckoutStore();

  if (isCompletatoPage) return null;
  return (
    <div className={twMerge(className)}>
      <RepilogoComponent
        basket={basket}
        totalPrice={totalPrice}
        isInputSconto={!isCompletatoPage}
      />
    </div>
  );
}
