"use client";

import styles from "@/components/PageCatalogComponents/ProductSection/product-catalogo.module.css";
import { useWishlistStore } from "@/store/wishlist-store";
import { useEffect, type ReactNode } from "react";
import PreferitiEmpty from "./PreferitiEmpty";

// The cards are server-rendered (CardProduct is a Server Component) and passed
// in as nodes; this client grid only controls VISIBILITY by reacting to the
// wishlist store. Un-hearting a card removes its id from the store, so the card
// disappears from the list instantly — no server round-trip, no per-user cache
// (which is forbidden for wishlist data — it would leak between users).
export default function PreferitiClientGrid({
  items,
}: {
  items: { id: string; card: ReactNode }[];
}) {
  const hydrate = useWishlistStore((state) => state.hydrate);
  const status = useWishlistStore((state) => state.status);
  const ids = useWishlistStore((state) => state.ids);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Before hydration show the server list as-is (avoids an empty flash); once
  // ready, filter by the store so removals are reflected live.
  const visible = status === "ready" ? items.filter((item) => ids.includes(item.id)) : items;

  if (status === "ready" && visible.length === 0) {
    return <PreferitiEmpty />;
  }

  return (
    <ul className={styles.list}>
      {visible.map((item) => (
        <li key={item.id}>{item.card}</li>
      ))}
    </ul>
  );
}
