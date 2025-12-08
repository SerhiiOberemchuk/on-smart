import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function ButtonXDellete({ ...rest }: {} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={twMerge(
        "h-10 w-10 rounded-full border border-red bg-red/10 text-red hover:bg-red-800",
        rest.className,
        rest.disabled && "cursor-not-allowed opacity-50",
      )}
    >
      x
    </button>
  );
}
