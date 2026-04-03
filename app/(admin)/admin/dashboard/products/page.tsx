import { getAllProductsAdmin } from "@/app/actions/admin/products/queries";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import ClientPageAllProducts from "./PageAllProducts";

export default function ProductsPage() {
  const res = getAllProductsAdmin({ includeHidden: true });

  return (
    <Suspense fallback={<Spiner />}>
      <ClientPageAllProducts productAction={res} />
    </Suspense>
  );
}
