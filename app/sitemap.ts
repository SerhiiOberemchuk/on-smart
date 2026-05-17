import { getAllBundles } from "@/app/actions/bundles/get-all-bundles";
import { getAllBrands } from "@/app/actions/brands/brand-actions";
import { getAllCategoryProducts } from "@/app/actions/category/category-actions";
import { getAllProducts } from "@/app/actions/product/get-all-products";
import { baseUrl } from "@/types/baseUrl";
import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";

const STATIC_PATHS = [
  "/",
  "/catalogo",
  "/chi-siamo",
  "/cookies",
  "/garanzia",
  "/informativa-sulla-privacy",
  "/pagamento",
  "/spedizione",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("default");

  const [productsResponse, bundlesResponse, brandsResponse, categoriesResponse] = await Promise.all(
    [getAllProducts(), getAllBundles(), getAllBrands(), getAllCategoryProducts()],
  );

  const products = (productsResponse.success ? productsResponse.data : []).filter(
    (product) => product.productType === "product" && product.parent_product_id === null,
  );
  const bundles = (bundlesResponse.data ?? []).filter((bundle) => !bundle.isHidden);
  const brands = brandsResponse.success ? brandsResponse.data : [];
  const categories = categoriesResponse.success ? categoriesResponse.data : [];

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const uniqueCategorySlugs = Array.from(new Set(categories.map((item) => item.category_slug)));
  const uniqueBrandSlugs = Array.from(new Set(brands.map((item) => item.brand_slug)));

  const categoryEntries: MetadataRoute.Sitemap = uniqueCategorySlugs.map((categorySlug) => ({
    url: `${baseUrl}/categoria/${encodeURIComponent(categorySlug)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const brandEntries: MetadataRoute.Sitemap = uniqueBrandSlugs.map((brandSlug) => ({
    url: `${baseUrl}/brand/${encodeURIComponent(brandSlug)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((item) => ({
    url: `${baseUrl}/catalogo/${encodeURIComponent(item.category_slug)}/${encodeURIComponent(item.brand_slug)}/${encodeURIComponent(item.slug)}`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const bundleEntries: MetadataRoute.Sitemap = bundles.map((item) => ({
    url: `${baseUrl}/catalogo/${encodeURIComponent(item.category_slug)}/${encodeURIComponent(item.brand_slug)}/bundle/${encodeURIComponent(item.slug)}`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...brandEntries,
    ...productEntries,
    ...bundleEntries,
  ];
}
