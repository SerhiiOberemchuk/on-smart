import { getAllBrands } from "@/app/actions/brands/brand-actions";
import BrandsPageClient from "./BrandPageClient";

export default async function BrandsPage() {
  const res = await getAllBrands();

  return <BrandsPageClient brandsData={res.data} />;
}
