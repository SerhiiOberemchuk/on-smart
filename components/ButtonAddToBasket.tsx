"use client";
import Image from "next/image";
import iconCart from "@/assets/icons/carrello.svg";
import { twMerge } from "tailwind-merge";
import { HtmlHTMLAttributes } from "react";
type ButtonAddToBasketProps = HtmlHTMLAttributes<HTMLButtonElement> & { disabled: boolean };

export default function ButtonAddToBasket({
  disabled,
  className,
  ...props
}: ButtonAddToBasketProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={twMerge(
        "btn flex items-center gap-2 rounded-sm bg-green px-4 py-3 text-white",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      <Image src={iconCart} alt="Pulsante aggiungi" />
      <span>Aggiungi</span>
    </button>
  );
}
