"use client";

import { useRef } from "react";
import Navigation from "./Navigation";

export default function MobileMenu() {
  const dialog = useRef<HTMLDialogElement>(null);
  const handleOpenMenu = () => {
    if (dialog.current) {
      dialog.current.showModal();
    }
  };
  const handleCloseMenu = () => {
    if (dialog.current) {
      dialog.current.close();
    }
  };
  return (
    <>
      <button
        className="btn rounded-sm border border-yellow-500 px-4 py-2.5 xl:hidden"
        type="button"
        aria-label="Pulsante aprire menu"
        onClick={handleOpenMenu}
      >
        Menu
      </button>
      <dialog
        id="mobile"
        ref={dialog}
        className="fixed top-0 bottom-0 left-0 min-h-dvh min-w-dvw bg-black/50"
        aria-modal="true"
      >
        <div className="bg-black px-4 py-6">
          <button
            className="btn mr-0 ml-auto flex rounded-sm border border-amber-500 px-4 py-3 text-white"
            aria-label="Chiudi menu"
            onClick={handleCloseMenu}
          >
            Chiudi
          </button>
          <Navigation
            onClick={handleCloseMenu}
            className="mt-8 ml-0 flex flex-col items-start gap-11 text-white xl:hidden"
          />
        </div>
      </dialog>
    </>
  );
}
