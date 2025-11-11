import { getAllProducts } from "@/app/actions/get-all-products/action";
import BrandPage from "@/components/BrandPage";

export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string }>;
}) {
  const { brand } = await params;
  const productsBrand = await getAllProducts();

  return <BrandPage products={productsBrand} brand={brand} />;
}
