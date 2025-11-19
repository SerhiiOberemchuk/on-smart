"use client";

import RepilogoComponent from "@/app/carrello/components/RepilogoComponent";
import { useCheckoutStore } from "@/store/checkout-store";
import { twMerge } from "tailwind-merge";

export default function LayoutRepilogoComponent({ className }: { className?: string }) {
  const { totalPrice, basket } = useCheckoutStore();
  return (
    <div className={twMerge(className)}>
      <RepilogoComponent totalPrice={totalPrice || 0} basket={basket || []} />
    </div>
  );
}
