import { getAllBrands } from "@/app/actions/admin/brands/queries";
import { getBundleByIdAdmin } from "@/app/actions/admin/bundles/queries";
import { getAllCategoryProducts } from "@/app/actions/admin/categories/queries";
import { getFotoFromGallery } from "@/app/actions/admin/product-details/queries";
import { getAllProductsAdmin } from "@/app/actions/admin/products/queries";
import Spiner from "@/components/Spiner";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageEditBundle from "../PageEditBundle";

type Props = {
  params: Promise<{ id: string }>;
};

export default function AdminBundleEditPage({ params }: Props) {
  return (
    <Suspense fallback={<Spiner />}>
      <GetDataComponent params={params} />
    </Suspense>
  );
}

async function GetDataComponent({ params }: Props) {
  const { id } = await params;

  const [bundleResponse, productsResponse, categoriesResponse, brandsResponse, galleryResponse] = await Promise.all([
    getBundleByIdAdmin(id),
    getAllProductsAdmin({ includeHidden: true }),
    getAllCategoryProducts(),
    getAllBrands(),
    getFotoFromGallery({ parent_product_id: id }),
  ]);

  if (!bundleResponse.success || !bundleResponse.data) {
    notFound();
  }

  const products = (productsResponse.data ?? []).filter((item) => item.productType !== "bundle");
  const categories = categoriesResponse.success ? categoriesResponse.data : [];
  const brands = brandsResponse.success ? brandsResponse.data : [];
  const galleryImages = galleryResponse.success && galleryResponse.data ? galleryResponse.data.images : [];
  const bundle = bundleResponse.data.bundle;
  const bundleMeta = bundleResponse.data.bundleMeta;

  return (
    <PageEditBundle
      bundle={bundle}
      bundleMeta={bundleMeta}
      products={products}
      categories={categories}
      brands={brands}
      galleryImages={galleryImages}
    />
  );
}
