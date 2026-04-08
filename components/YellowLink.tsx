import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function LinkYellow({
  title,
  href,
  ariaLabel,
  className,
  target,
  rel,
  children,
}: {
  title?: string;
  href: "/catalogo" | "https://g.page/r/CRhuErfSy0siEAE/review" | string;
  ariaLabel?: string;
  className?: string;
  target?: string;
  rel?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      target={target}
      rel={rel}
      href={href}
      className={twMerge("btn rounded-sm bg-yellow-500 px-4 py-3 text-black", className)}
      aria-label={ariaLabel}
    >
      {title || children}
    </Link>
  );
}
