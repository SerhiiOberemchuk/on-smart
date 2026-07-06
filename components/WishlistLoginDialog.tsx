"use client";

import { useWishlistStore } from "@/store/wishlist-store";
import Link from "next/link";

export default function WishlistLoginDialog() {
  const open = useWishlistStore((state) => state.loginPromptOpen);
  const close = useWishlistStore((state) => state.closeLoginPrompt);
  const redirect = useWishlistStore((state) => state.loginRedirect);

  if (!open) return null;

  const redirectParam = `?redirect=${encodeURIComponent(redirect)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Salva i tuoi preferiti"
      onClick={close}
      className="fixed inset-0 z-[1300] grid place-items-center bg-white/50 p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-sm bg-background p-6 text-center"
      >
        <h2 className="H5">Salva i tuoi preferiti</h2>
        <p className="helper_text">Accedi o registrati per salvare i prodotti nei preferiti.</p>
        <div className="flex flex-col gap-2">
          <Link
            href={`/accedi${redirectParam}`}
            className="rounded-sm bg-yellow-500 px-4 py-3 font-medium text-black transition hover:bg-yellow-400"
            onClick={close}
          >
            Accedi
          </Link>
          <Link
            href={`/registrati${redirectParam}`}
            className="rounded-sm border border-stroke-grey px-4 py-3 transition hover:bg-white/5"
            onClick={close}
          >
            Registrati
          </Link>
          <button type="button" onClick={close} className="helper_text mt-1 underline">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
