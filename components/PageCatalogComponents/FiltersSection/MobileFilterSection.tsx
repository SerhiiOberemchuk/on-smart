"use client";

import Image from "next/image";
import icon_filter from "@/assets/icons/icon_filter.svg";
import { useEffect, useState } from "react";
import ListFiltereOptions from "./ListFilterOptions";

export default function MobileFilterSection() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isFilterOpen]);
  return (
    <div className="container py-2 lg:hidden">
      <button
        type="button"
        onClick={() => setIsFilterOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-sm border border-yellow-500 py-2"
      >
        <Image src={icon_filter} alt="filter icon" width={24} height={24} />
        <span>Filtra i risultati</span>
      </button>
      {isFilterOpen && (
        <div className="fixed top-0 right-0 bottom-0 left-0 z-50 container flex h-svh max-h-dvh min-h-svh flex-col bg-background">
          <header className="flex w-full justify-end py-6">
            <button
              type="button"
              className="btn rounded-sm border border-yellow-500 px-4 py-3"
              onClick={() => setIsFilterOpen(false)}
            >
              Chiudi
            </button>
          </header>
          <main className="flex-1 overflow-y-scroll">
            <ListFiltereOptions className="w-full max-w-full" />
          </main>
          <footer className="py-6">
            <button
              type="button"
              className="btn flex w-full justify-center rounded-sm bg-yellow-500 px-4 py-3 text-black"
              onClick={() => setIsFilterOpen(false)}
            >
              Mostrare i risultati
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
