"use client";

import { list_nav } from "../project-data/pages.types";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function Navigation({
  className,
  onClick,
  linkPY,
  mobile = false,
  footer = false,
}: {
  className?: string;
  onClick?: () => void;
  linkPY?: string;
  mobile?: boolean;
  footer?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav
      className={clsx(
        twMerge(`hidden w-full max-w-lg items-center justify-between pl-6 xl:flex`, className),
      )}
    >
      {list_nav.map((item, index) => {
        const isLastItem = list_nav.length === index + 1;
        if (item.href === "/garanzia" && !footer) return null;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={clsx(
              twMerge(
                "H5 xl:hover:underline",
                pathname === item.href && "text-yellow-600 underline",
                mobile ? "w-full" : "p-3",
                footer &&
                  clsx("w-full text-center md:p-0 md:text-start", isLastItem && "md:col-start-2"),
                linkPY,
              ),
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
