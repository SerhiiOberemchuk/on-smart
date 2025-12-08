import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import CardSection from "./components/CardSection";

export default async function CarrelloPage() {
  const products = await getAllProducts({});
  if (!products.data) return;
  return (
    <>
      <CardSection />
      <ProductRowListSection
        title="Acquistati insieme"
        productsList={products.data}
        idSection="page_product_insieme"
        isBottomLink={false}
      />
    </>
  );
}
