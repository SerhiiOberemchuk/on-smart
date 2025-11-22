import { getAllProducts } from "@/app/actions/product/get-all-products";
import { getProductById } from "@/app/actions/product/get-product-by-id";
import { getProductDetailsById } from "@/app/actions/product/get-product-details-by-Id";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCharacteristicsSection from "@/components/ProductPageSections/ProductCharacteristicsSection/ProductCharacteristacSection";
import VisualProductSection from "@/components/ProductPageSections/VisualTopSection/VisualProductSection";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";
// import { connection } from "next/server";

export default async function PageSlugId({ id }: { id: string }) {
  // await connection();

  const product = await getProductById(id);
  const products = await getAllProducts({});
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
