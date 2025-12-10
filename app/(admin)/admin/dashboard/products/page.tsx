import { Suspense } from "react";
import { getAllProducts, ProductFetchResult } from "@/app/actions/product/get-all-products";
import ClientPageAllProducts from "./PageAllProducts";

export default function ProductsPage() {
  const res: Promise<ProductFetchResult> = getAllProducts();

  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <ClientPageAllProducts productAction={res}></ClientPageAllProducts>
    </Suspense>
  );
}
