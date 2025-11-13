import { getAllProducts } from "@/app/actions/get-all-products/action";
import { getProductById } from "@/app/actions/get-product-by-id/action";
import ProductCharacteristicsSection from "@/components/ProductPageSections/ProductCharacteristicsSection/ProductCharacteristacSection";
import VisualProductSection from "@/components/ProductPageSections/VisualTopSection/VisualProductSection";
import ProductRowListSection from "@/components/ProductRowListSection/ProductRowListSection";

export default async function CategoryBrandPage({
  params,
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ category: string; brand: string; id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  const products = await getAllProducts();
  const tab = (await searchParams).tab;
  console.log({ tab });

  return (
    <>
      {product && <VisualProductSection product={product} />}
      {product && <ProductCharacteristicsSection product={product} />}
      <ProductRowListSection
        title="Acquistati insieme"
        productsList={products}
        idSection="page_product_insieme"
        isBottomLink={false}
      />
    </>
  );
}
