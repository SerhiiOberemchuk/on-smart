import { getAllProducts } from "@/app/actions/product/get-all-products";
import CardSection from "./components/CardSection";
import ProductSuspensedListCarello from "./ProductSuspensedListCarello";
import { Suspense } from "react";

export default function CarrelloPage() {
  const products = getAllProducts();

  return (
    <>
      <Suspense>
        <CardSection />
      </Suspense>
      <Suspense>
        <ProductSuspensedListCarello productsAction={products} />
      </Suspense>
    </>
  );
}
