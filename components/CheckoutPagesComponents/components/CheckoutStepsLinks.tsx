"use client";

import { useCheckoutStore } from "@/store/checkout-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { PAGES } from "@/types/pages.types";

export const checkoutSteps = [
  { label: "I tuoi dati", href: PAGES.CHECKOUT_PAGES.INFORMATION, checkoutStep: 1 },
  { label: "Consegna", href: PAGES.CHECKOUT_PAGES.DELIVERY, checkoutStep: 2 },
  { label: "Pagamento", href: PAGES.CHECKOUT_PAGES.PAYMENT, checkoutStep: 3 },
  { label: "Riepilogo", href: PAGES.CHECKOUT_PAGES.SUMMARY, checkoutStep: 4 },
];

export default function CheckoutStepsLinks() {
  const path = usePathname();
  const { step: storeStep } = useCheckoutStore();
  return (
    <nav className="flex gap-5 overflow-x-auto border-b-2 border-stroke-grey">
      {checkoutSteps.map((step) => (
        <Link
          key={step.href}
          href={step.checkoutStep <= storeStep ? step.href : "#"}
          aria-current={step.checkoutStep === storeStep ? "step" : undefined}
          className={twMerge(
            "H5 pb-3 text-center text-sm font-medium hover:text-yellow-600",
            path === step.href ? "border-b-2 border-yellow-600 text-yellow-600" : "text-white",
            step.checkoutStep > storeStep ? "pointer-events-none opacity-50" : "",
          )}
        >
          {step.label}
        </Link>
      ))}
    </nav>
  );
}
