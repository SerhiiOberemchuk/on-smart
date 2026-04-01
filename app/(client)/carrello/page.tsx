import { getAllProducts } from "@/app/actions/product/get-all-products";
import CardSection from "./components/CardSection";
import ProductSuspensedListCarello from "./ProductSuspensedListCarello";
import { Suspense } from "react";

function CartRecommendations() {
  const productsAction = getAllProducts({ includeHidden: false });
  return <ProductSuspensedListCarello productsAction={productsAction} />;
}

export default function CarrelloPage() {
  return (
    <>
      <Suspense fallback={null}>
        <CardSection />
      </Suspense>
      <Suspense fallback={null}>
        <CartRecommendations />
      </Suspense>
    </>
  );
}
