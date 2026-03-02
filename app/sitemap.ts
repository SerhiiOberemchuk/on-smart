import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { baseUrl } from "@/types/baseUrl";
import { isProductionBuild } from "@/utils/is-production-build";
import { withRetry } from "@/utils/with-retry";
import { and, eq, isNull } from "drizzle-orm";
import type { MetadataRoute } from "next";

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
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  if (isProductionBuild()) {
    return staticEntries;
  }

  const [products, bundles, brands, categories] = await Promise.all([
    withRetry(() =>
      db
        .select({
          slug: productsSchema.slug,
          brand_slug: productsSchema.brand_slug,
          category_slug: productsSchema.category_slug,
        })
        .from(productsSchema)
        .where(
          and(eq(productsSchema.productType, "product"), isNull(productsSchema.parent_product_id)),
        ),
    ),
    withRetry(() =>
      db
        .select({
          slug: productsSchema.slug,
          brand_slug: productsSchema.brand_slug,
          category_slug: productsSchema.category_slug,
        })
        .from(productsSchema)
        .where(eq(productsSchema.productType, "bundle")),
    ),
    withRetry(() =>
      db
        .select({
          brand_slug: brandProductsSchema.brand_slug,
        })
        .from(brandProductsSchema),
    ),
    withRetry(() =>
      db
        .select({
          category_slug: categoryProductsSchema.category_slug,
        })
        .from(categoryProductsSchema),
    ),
  ]);

  const categoryEntries: MetadataRoute.Sitemap = categories.map((item) => ({
    url: `${baseUrl}/categoria/${encodeURIComponent(item.category_slug)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const brandEntries: MetadataRoute.Sitemap = brands.map((item) => ({
    url: `${baseUrl}/brand/${encodeURIComponent(item.brand_slug)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((item) => ({
    url: `${baseUrl}/catalogo/${encodeURIComponent(item.category_slug)}/${encodeURIComponent(item.brand_slug)}/${encodeURIComponent(item.slug)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const bundleEntries: MetadataRoute.Sitemap = bundles.map((item) => ({
    url: `${baseUrl}/catalogo/${encodeURIComponent(item.category_slug)}/${encodeURIComponent(item.brand_slug)}/bundle/${encodeURIComponent(item.slug)}`,
    lastModified: now,
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
