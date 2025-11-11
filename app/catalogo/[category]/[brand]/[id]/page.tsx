import { getAllProducts } from "@/app/actions/get-all-products/action";
import { getProductById } from "@/app/actions/get-product-by-id/action";
import VisualProductSection from "@/components/ProductPage/VisualProductSection";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";

export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  const products = await getAllProducts();
  return (
    <>
      {product && <VisualProductSection product={product} />}
      <ProductRowListSection
        title="Acquistati insieme"
        productsList={products}
        idSection="page_product_insieme"
        isBottomLink={false}
      />
    </>
  );
}
