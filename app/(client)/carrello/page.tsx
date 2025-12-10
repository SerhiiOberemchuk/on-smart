import { getAllProducts, ProductFetchResult } from "@/app/actions/product/get-all-products";
import CardSection from "./components/CardSection";
import ProductSuspensedListCarello from "./ProductSuspensedListCarello";
import { Suspense } from "react";

export default function CarrelloPage() {
  const products: Promise<ProductFetchResult> = getAllProducts();

  return (
    <>
      <CardSection />
      <Suspense>
        <ProductSuspensedListCarello productsAction={products} />
      </Suspense>
    </>
  );
}
