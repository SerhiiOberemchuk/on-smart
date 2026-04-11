import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { baseUrl } from "@/types/baseUrl";
import { and, eq, isNull } from "drizzle-orm";
import type { MetadataRoute } from "next";

const STATIC_PATHS = [
  "/",
  "/catalogo",
  "/chi-siamo",
  "/carrello",
  "/cookies",
  "/garanzia",
  "/informativa-sulla-privacy",
  "/pagamento",
  "/spedizione",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, bundles, brands, categories] = await Promise.all([
    db
      .select({
        slug: productsSchema.slug,
        brand_slug: productsSchema.brand_slug,
        category_slug: productsSchema.category_slug,
      })
      .from(productsSchema)
      .where(
        and(
          eq(productsSchema.productType, "product"),
          isNull(productsSchema.parent_product_id),
          eq(productsSchema.isHidden, false),
        ),
      ),
    db
      .select({
        slug: productsSchema.slug,
        brand_slug: productsSchema.brand_slug,
        category_slug: productsSchema.category_slug,
      })
      .from(productsSchema)
      .where(and(eq(productsSchema.productType, "bundle"), eq(productsSchema.isHidden, false))),
    db
      .select({
        brand_slug: brandProductsSchema.brand_slug,
      })
      .from(brandProductsSchema),
    db
      .select({
        category_slug: categoryProductsSchema.category_slug,
      })
      .from(categoryProductsSchema),
  ]);

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

  return [...staticEntries, ...categoryEntries, ...brandEntries, ...productEntries, ...bundleEntries];
}
