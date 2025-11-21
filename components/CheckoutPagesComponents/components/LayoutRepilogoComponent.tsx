"use client";

import RepilogoComponent from "@/app/carrello/components/RepilogoComponent";
import { useCheckoutStore } from "@/store/checkout-store";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function LayoutRepilogoComponent({ className }: { className?: string }) {
  const { totalPrice, basket } = useCheckoutStore();
  const pathName = usePathname();
  return (
    <div className={twMerge(className)}>
      <RepilogoComponent
        totalPrice={totalPrice || 0}
        basket={basket || []}
        isInputSconto={pathName !== "/checkout/completato"}
      />
    </div>
  );
}
