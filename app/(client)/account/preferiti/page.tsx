import { getWishlistProducts } from "@/app/actions/account/wishlist/get-wishlist-products";
import CardProduct from "@/components/ProductCard/CardProduct";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

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
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="helper_text">Non hai ancora prodotti tra i preferiti.</p>
        <Link href="/catalogo" className="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black">
          Vai al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {products.map((product) => (
        <CardProduct key={product.id} {...product} />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-80 w-full animate-pulse rounded-md bg-black/10" />
      ))}
    </div>
  );
}
