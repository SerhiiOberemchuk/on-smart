"use client";

import { signOutCustomer } from "@/app/actions/account/auth/sign-out";
import userIcon from "@/assets/icons/user.svg";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export default function AccountMenu({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 p-3 md:px-4 md:py-2"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Image src={userIcon} width={24} alt="" title="Account" />
        <span className="btn hidden max-w-28 truncate xs:block">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 flex w-56 flex-col rounded-md border border-stroke-grey bg-background py-2 shadow-lg"
        >
          {isAdmin && (
            <Link
              role="menuitem"
              href="/admin/dashboard"
              className="px-4 py-2 font-medium hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Amministrazione
            </Link>
          )}
          <Link
            role="menuitem"
            href="/account/ordini"
            className="px-4 py-2 hover:bg-black/5"
            onClick={() => setOpen(false)}
          >
            I miei ordini
          </Link>
          <Link
            role="menuitem"
            href="/account/profilo"
            className="px-4 py-2 hover:bg-black/5"
            onClick={() => setOpen(false)}
          >
            Il mio profilo
          </Link>
          <Link
            role="menuitem"
            href="/account/indirizzi"
            className="px-4 py-2 hover:bg-black/5"
            onClick={() => setOpen(false)}
          >
            I miei indirizzi
          </Link>
          <Link
            role="menuitem"
            href="/account/preferiti"
            className="px-4 py-2 hover:bg-black/5"
            onClick={() => setOpen(false)}
          >
            I miei preferiti
          </Link>
          <form action={signOutCustomer} className="mt-1 border-t border-stroke-grey pt-1">
            <SignOutButton />
          </form>
        </div>
      )}
    </div>
  );
}

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-black/5 disabled:pointer-events-none disabled:opacity-60"
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
