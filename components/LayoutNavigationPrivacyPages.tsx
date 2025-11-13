"use client";

import { privacy_nav_links } from "@/project-data/pages.types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function LayoutNavigationPrivacyPages() {
  const path = usePathname();

  return (
    <nav className="flex flex-col gap-4 py-3 xl:py-0">
      {privacy_nav_links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={twMerge(item.href === path && "text-yellow-500")}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
