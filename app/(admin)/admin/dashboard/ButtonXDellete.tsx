import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function ButtonXDellete({ ...rest }: {} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={twMerge(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-600 bg-transparent text-base font-medium text-red-500 transition hover:bg-red-600/15 hover:text-red-400",
        rest.className,
        rest.disabled && "cursor-not-allowed opacity-50",
      )}
    >
      x
    </button>
  );
}
