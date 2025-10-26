"use client";

import { list_nav } from "@/project-data/pages.types";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="ml-auto flex gap-11">
      {list_nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx("text-[20px] font-medium", pathname === item.href && "text-yellow-600")}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
