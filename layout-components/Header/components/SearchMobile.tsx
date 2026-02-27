"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import icon from "@/assets/icons/icon_search.svg";
import Search from "./Search";

export default function SearchMobile() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="p-3 sm:hidden"
        aria-label="Cerca"
        onClick={() => setIsOpen(true)}
      >
        <Image src={icon} alt="Cerca" aria-hidden />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-1200 bg-black/70 p-4 sm:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="mx-auto mt-16 w-full max-w-xl rounded bg-header-footer p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-white">Cerca nel catalogo</p>
              <button
                type="button"
                className="rounded border border-yellow-500 px-3 py-1 text-sm text-white"
                onClick={() => setIsOpen(false)}
              >
                Chiudi
              </button>
            </div>

            <Search mobile onNavigate={() => setIsOpen(false)} autoFocus />
          </div>
        </div>
      ) : null}
    </>
  );
}
