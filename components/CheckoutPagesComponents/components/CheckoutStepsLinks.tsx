"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export const checkoutSteps = [
  { label: "I tuoi dati", href: "/checkout" },
  { label: "Consegna", href: "/checkout/consegna" },
  { label: "Pagamento", href: "/checkout/pagamento" },
];

export default function CheckoutStepsLinks() {
  const path = usePathname();

  return (
    <nav className="flex gap-5 overflow-x-auto border-b-2 border-stroke-grey">
      {checkoutSteps.map((step) => (
        <Link
          key={step.href}
          href={step.href}
          className={twMerge(
            "H5 pb-3 text-center text-sm font-medium hover:text-yellow-600",
            path === step.href ? "border-b-2 border-yellow-600 text-yellow-600" : "text-white",
          )}
        >
          {step.label}
        </Link>
      ))}
    </nav>
  );
}
