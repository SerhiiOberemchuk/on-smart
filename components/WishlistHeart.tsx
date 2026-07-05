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
        <path d="M12 21s-7.5-4.9-10-9.4C.6 8.8 2 5.5 5 5c2-.3 3.5 1 4 2 .5-1 2-2.3 4-2 3 .5 4.4 3.8 3 6.6C19.5 16.1 12 21 12 21z" />
      </svg>
    </button>
  );
}
