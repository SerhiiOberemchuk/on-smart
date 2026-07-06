"use client";

import { signOutCustomer } from "@/app/actions/account/auth/sign-out";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { ACCOUNT_LINKS } from "./account-nav";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ACCOUNT_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "rounded-sm px-4 py-2 transition hover:bg-white/5",
              active && "bg-white/5 font-medium",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <form action={signOutCustomer} className="mt-2 border-t border-stroke-grey pt-2">
        <SignOutButton />
      </form>
    </nav>
  );
}

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-2 rounded-sm px-4 py-2 text-left transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      Esci
    </button>
  );
}
