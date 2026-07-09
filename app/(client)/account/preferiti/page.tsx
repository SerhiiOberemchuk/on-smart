import { getWishlistProducts } from "@/app/actions/account/wishlist/get-wishlist-products";
import CardProduct from "@/components/ProductCard/CardProduct";
import styles from "@/components/PageCatalogComponents/ProductSection/product-catalogo.module.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import PreferitiClientGrid from "./PreferitiClientGrid";
import PreferitiEmpty from "./PreferitiEmpty";

export const metadata: Metadata = {
  title: "I miei preferiti — On-Smart",
  robots: { index: false, follow: false },
};

export default function PreferitiPage() {
  return (
    <section>
      <h1 className="H2 mb-6">I miei preferiti</h1>
      <Suspense fallback={<GridSkeleton />}>
        <PreferitiGrid />
      </Suspense>
    </section>
  );
}

async function PreferitiGrid() {
  const products = await getWishlistProducts();

  if (products.length === 0) {
    return <PreferitiEmpty />;
  }

  // Render the cards on the server (CardProduct is a Server Component), then let
  // the client grid control which stay visible as the wishlist changes.
  const items = products.map((product) => ({
    id: product.id,
    card: <CardProduct {...product} className={styles.card} />,
  }));

  return <PreferitiClientGrid items={items} />;
}

function GridSkeleton() {
  return (
    <ul className={styles.list}>
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i}>
          <div className="h-72 w-full animate-pulse rounded-sm bg-white/10" />
        </li>
      ))}
    </ul>
  );
}
