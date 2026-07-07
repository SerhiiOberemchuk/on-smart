"use client";

import { useWishlistStore } from "@/store/wishlist-store";
import clsx from "clsx";
import { useEffect } from "react";

export default function WishlistHeart({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const hydrate = useWishlistStore((state) => state.hydrate);
  const toggle = useWishlistStore((state) => state.toggle);
  const inList = useWishlistStore((state) => state.ids.includes(productId));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={inList}
      aria-label={inList ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      title={inList ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      className={clsx(
        "grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur transition hover:bg-white",
        className,
      )}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={inList ? "#EAB308" : "none"}
        stroke={inList ? "#EAB308" : "#111111"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
