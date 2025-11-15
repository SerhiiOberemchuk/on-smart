import { getAllProducts } from "@/app/actions/product/get-all-products";
import { getProductById } from "@/app/actions/product/get-product-by-id";
import { getProductDetailsById } from "@/app/actions/product/get-product-details-by-Id";
import ProductCharacteristicsSection from "@/components/ProductPageSections/ProductCharacteristicsSection/ProductCharacteristacSection";
import VisualProductSection from "@/components/ProductPageSections/VisualTopSection/VisualProductSection";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";

export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  const products = await getAllProducts();
  const productDetails = await getProductDetailsById(id);

  return (
    <>
      {product && <VisualProductSection product={product} />}
      {productDetails && <ProductCharacteristicsSection productDetail={productDetails} />}
      <ProductRowListSection
        title="Acquistati insieme"
        productsList={products}
        idSection="page_product_insieme"
        isBottomLink={false}
      />
    </>
  );
}
