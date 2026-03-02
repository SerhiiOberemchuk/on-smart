import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { getBundleById } from "@/app/actions/bundles/get-bundle-by-id";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { getFotoFromGallery } from "@/app/actions/foto-galery/get-foto-from-gallery";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import { notFound } from "next/navigation";
import PageEditBundle from "../PageEditBundle";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminBundleEditPage({ params }: Props) {
  const { id } = await params;

  const [bundleResponse, productsResponse, categoriesResponse, brandsResponse, galleryResponse] = await Promise.all([
    getBundleById(id),
    getAllProducts(),
    getAllCategoryProducts().catch((error) => {
      console.error("[AdminBundleEditPage:getAllCategoryProducts]", error);
      return { success: false, data: [], error };
    }),
    getAllBrands().catch((error) => {
      console.error("[AdminBundleEditPage:getAllBrands]", error);
      return { success: false, data: [], error };
    }),
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
