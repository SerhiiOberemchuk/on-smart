import { getAllProducts } from "@/app/actions/product/get-all-products";
import { getProductById } from "@/app/actions/product/get-product-by-id";
import { getProductDetailsById } from "@/app/actions/product/get-product-details-by-Id";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCharacteristicsSection from "@/components/ProductPageSections/ProductCharacteristicsSection/ProductCharacteristacSection";
import VisualProductSection from "@/components/ProductPageSections/VisualTopSection/VisualProductSection";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
import { parseSlugWithId } from "@/utils/parse-slug-with-Id";

export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string; slugId: string }>;
}) {
  const { slugId } = await params;
  const { id } = parseSlugWithId(slugId);
  console.log({ id });

  if (!id) {
    return;
  }
  const product = await getProductById(id);
  const products = await getAllProducts();
  const productDetails = await getProductDetailsById(id);

  return (
    <>
      <Breadcrumbs
        category={product?.category}
        brand={product?.brand}
        productName={product?.name}
      />
      {product && <VisualProductSection product={product} />}
      {productDetails && product && (
        <ProductCharacteristicsSection product={product} productDetail={productDetails} />
      )}
      <ProductRowListSection
        title="Acquistati insieme"
        productsList={products}
        idSection="page_product_insieme"
        isBottomLink={false}
      />
    </>
  );
}
