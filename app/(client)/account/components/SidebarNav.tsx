"use client";

import { signOutCustomer } from "@/app/actions/account/auth/sign-out";
import { useWishlistStore } from "@/store/wishlist-store";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import AccountNavIcon from "./AccountNavIcon";
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
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-sm px-4 py-2.5 transition",
              active
                ? "bg-yellow-500/10 font-semibold text-yellow-500"
                : "text-white hover:bg-white/5",
            )}
          >
            <AccountNavIcon
              name={link.icon}
              className={clsx("h-5 w-5 shrink-0", active ? "text-yellow-500" : "text-text-grey")}
            />
            {link.label}
          </Link>
        );
      })}
      <form
        action={signOutCustomer}
        onSubmit={() => useWishlistStore.getState().reset()}
        className="mt-2 border-t border-stroke-grey pt-2"
      >
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
      className="flex w-full items-center gap-3 rounded-sm px-4 py-2.5 text-left text-text-grey transition hover:bg-red-500/10 hover:text-red-300 disabled:pointer-events-none disabled:opacity-60"
    >
      <svg
        className={clsx("h-5 w-5 shrink-0", pending && "animate-spin")}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {pending ? (
          <>
            <circle cx="12" cy="12" r="10" className="opacity-25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" />
          </>
        ) : (
          <>
            <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" />
            <path d="M10 17l-5-5 5-5" />
            <path d="M5 12h11" />
          </>
        )}
      </svg>
      Esci
    </button>
  );
}
