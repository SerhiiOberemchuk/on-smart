import { getAllProducts, ProductFetchResult } from "@/app/actions/product/get-all-products";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import ClientPageAllProducts from "./PageAllProducts";

export default function ProductsPage() {
  const res: Promise<ProductFetchResult> = getAllProducts({ includeHidden: true });

  return (
    <Suspense fallback={<Spiner />}>
      <ClientPageAllProducts productAction={res} />
    </Suspense>
  );
}
