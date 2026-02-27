import { getAllProducts, ProductFetchResult } from "@/app/actions/product/get-all-products";
import { Suspense } from "react";
import ClientPageAllProducts from "./PageAllProducts";

export default function ProductsPage() {
  const res: Promise<ProductFetchResult> = getAllProducts();

  return (
    <Suspense fallback={<p className="admin-muted">Завантаження...</p>}>
      <ClientPageAllProducts productAction={res} />
    </Suspense>
  );
}
