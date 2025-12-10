import { Suspense } from "react";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import ClientPageAllProducts from "./PageAllProducts";
import { Product } from "@/db/schemas/product";

export type ProductFetchResult = {
  success: boolean;
  data: Product[] | null;
  error: string | null;
};

export default function ProductsPage() {
  const res: Promise<ProductFetchResult> = getAllProducts();

  return (
    <Suspense fallback={<p>Завантаження...</p>}>
      <ClientPageAllProducts productAction={res}></ClientPageAllProducts>
    </Suspense>
  );
}
