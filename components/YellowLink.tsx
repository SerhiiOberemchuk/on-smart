import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function LinkYellow({
  title,
  href,
  ariaLabel,
  className,
}: {
  title: string;
  href: "/catalogo";
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={twMerge("btn rounded-sm bg-yellow-500 px-4 py-3 text-black", className)}
      aria-label={ariaLabel}
    >
      {title}
    </Link>
  );
}
