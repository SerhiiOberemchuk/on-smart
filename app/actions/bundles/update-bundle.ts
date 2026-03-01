"use server";

import { db } from "@/db/db";
import { brandProductsSchema } from "@/db/schemas/brand-products.schema";
import {
  type BundleMetaIncludedProduct,
  bundleMetaSchema,
} from "@/db/schemas/bundle-meta.schema";
import { categoryProductsSchema } from "@/db/schemas/caregory-products.schema";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { type ProductInsertType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq, inArray } from "drizzle-orm";
import { updateTag } from "next/cache";

type BundleMetaPayload = {
  includedProducts?: BundleMetaIncludedProduct[];
  advantages?: string[];
  description?: string | null;
};

type UpdateBundlePayload = {
  id: string;
} & Omit<
  ProductInsertType,
  "id" | "brand_slug" | "category_slug" | "imgSrc" | "productType"
> & {
    brand_id: string;
    productIds: string[];
    imgSrc: string[];
    bundleMeta?: BundleMetaPayload;
  };

function normalizeBundleMeta(productIds: string[], bundleMeta?: BundleMetaPayload) {
  const includedById = new Map((bundleMeta?.includedProducts ?? []).map((item) => [item.productId, item]));
  const includedProducts = productIds.map((productId) => {
    const item = includedById.get(productId);
    const quantity = Number(item?.quantity ?? 1);
    return {
      productId,
      quantity: Number.isFinite(quantity) && quantity > 0 ? Math.trunc(quantity) : 1,
      shortDescription: item?.shortDescription?.trim() ?? "",
    };
  });

  const advantages = (bundleMeta?.advantages ?? []).map((item) => item.trim()).filter(Boolean);
  const description = (bundleMeta?.description ?? "").trim();

  return {
    includedProducts,
    advantages,
    description,
  };
}

export async function updateBundle(formData: UpdateBundlePayload) {
  if (!formData.id) {
    return { success: false, error: "Bundle not found" };
  }

  if (!formData.brand_id) {
    return { success: false, error: "Select bundle brand" };
  }

  const uniqueProductIds = Array.from(new Set(formData.productIds));

  if (uniqueProductIds.length === 0) {
    return { success: false, error: "Select at least one product for bundle" };
  }

  if (formData.imgSrc.length === 0) {
    return { success: false, error: "Upload at least one bundle image" };
  }

  const parsedInStock = Number(formData.inStock);
  if (!Number.isFinite(parsedInStock) || parsedInStock < 0) {
    return { success: false, error: "Stock must be >= 0" };
  }

  try {
    const existingBundle = await db
      .select({
        id: productsSchema.id,
        slug: productsSchema.slug,
      })
      .from(productsSchema)
      .where(and(eq(productsSchema.id, formData.id), eq(productsSchema.productType, "bundle")))
      .limit(1);

    if (existingBundle.length === 0) {
      return { success: false, error: "Bundle not found" };
    }

    const category = await db
      .select({
        id: categoryProductsSchema.id,
        category_slug: categoryProductsSchema.category_slug,
      })
      .from(categoryProductsSchema)
      .where(eq(categoryProductsSchema.id, formData.category_id))
      .limit(1);

    if (category.length === 0) {
      return { success: false, error: "Category not found" };
    }

    const brand = await db
      .select({
        id: brandProductsSchema.id,
        brand_slug: brandProductsSchema.brand_slug,
      })
      .from(brandProductsSchema)
      .where(eq(brandProductsSchema.id, formData.brand_id))
      .limit(1);

    if (brand.length === 0) {
      return { success: false, error: "Brand not found" };
    }

    const existingSlug = await db
      .select({ id: productsSchema.id })
      .from(productsSchema)
      .where(eq(productsSchema.slug, formData.slug))
      .limit(1);

    if (existingSlug.length > 0 && existingSlug[0].id !== formData.id) {
      return { success: false, error: "Bundle slug already exists" };
    }

    const existingBundleMeta = await db
      .select({
        includedProducts: bundleMetaSchema.includedProducts,
      })
      .from(bundleMetaSchema)
      .where(eq(bundleMetaSchema.bundle_id, formData.id))
      .limit(1);
    const previousProductIds = Array.from(
      new Set((existingBundleMeta[0]?.includedProducts ?? []).map((item) => item.productId)),
    );

    const affectedProductIds = Array.from(new Set([...previousProductIds, ...uniqueProductIds]));
    const affectedProducts =
      affectedProductIds.length > 0
        ? await db
            .select({
              id: productsSchema.id,
              bundleIds: productsSchema.bundleIds,
            })
            .from(productsSchema)
            .where(and(inArray(productsSchema.id, affectedProductIds), eq(productsSchema.productType, "product")))
        : [];

    const affectedProductsMap = new Map(affectedProducts.map((item) => [item.id, item]));
    const missingProductIds = uniqueProductIds.filter((id) => !affectedProductsMap.has(id));

    if (missingProductIds.length > 0) {
      return {
        success: false,
        error: `Some products were not found: ${missingProductIds.join(", ")}`,
      };
    }

    const [firstImage] = formData.imgSrc;
    const galleryImages = formData.imgSrc.slice(1);
    const normalizedBundleMeta = normalizeBundleMeta(uniqueProductIds, formData.bundleMeta);

    const {
      id,
      brand_id: _brandId,
      productIds: _productIds,
      imgSrc: _images,
      bundleMeta: _bundleMeta,
      ...bundleData
    } = formData;
    const payload: Omit<ProductInsertType, "id"> = {
      ...bundleData,
      brand_slug: brand[0].brand_slug,
      category_slug: category[0].category_slug,
      imgSrc: firstImage,
      inStock: parsedInStock,
      oldPrice: formData.oldPrice ?? null,
      isOnOrder: formData.isOnOrder ?? false,
      productType: "bundle",
      hasVariants: false,
      variants: [],
      relatedProductIds: [],
      parent_product_id: null,
      bundleIds: [],
    };

    const nextProductIdsSet = new Set(uniqueProductIds);

    await db.transaction(async (tx) => {
      await tx.update(productsSchema).set(payload).where(eq(productsSchema.id, id));

      for (const product of affectedProducts) {
        const currentBundleIds = product.bundleIds ?? [];
        const withoutCurrentBundle = currentBundleIds.filter((bundleId) => bundleId !== id);
        const nextBundleIds = nextProductIdsSet.has(product.id)
          ? Array.from(new Set([...withoutCurrentBundle, id]))
          : withoutCurrentBundle;

        await tx
          .update(productsSchema)
          .set({
            bundleIds: nextBundleIds,
          })
          .where(eq(productsSchema.id, product.id));
      }

      await tx
        .insert(bundleMetaSchema)
        .values({
          bundle_id: id,
          includedProducts: normalizedBundleMeta.includedProducts,
          advantages: normalizedBundleMeta.advantages,
          description: normalizedBundleMeta.description,
        })
        .onDuplicateKeyUpdate({
          set: {
            includedProducts: normalizedBundleMeta.includedProducts,
            advantages: normalizedBundleMeta.advantages,
            description: normalizedBundleMeta.description,
          },
        });

      const existingGallery = await tx
        .select()
        .from(productFotoGallery)
        .where(eq(productFotoGallery.parent_product_id, id))
        .limit(1);

      if (existingGallery.length > 0) {
        await tx
          .update(productFotoGallery)
          .set({ images: galleryImages })
          .where(eq(productFotoGallery.parent_product_id, id));
      } else if (galleryImages.length > 0) {
        await tx.insert(productFotoGallery).values({
          parent_product_id: id,
          images: galleryImages,
        });
      }
    });

    updateTag(CACHE_TAGS.bundle.all);
    updateTag(CACHE_TAGS.bundle.byId(id));
    if (existingBundle[0].slug) {
      updateTag(CACHE_TAGS.bundle.bySlug(existingBundle[0].slug));
    }
    updateTag(CACHE_TAGS.bundle.bySlug(formData.slug));
    updateTag(CACHE_TAGS.product.all);
    updateTag(CACHE_TAGS.bundleMeta.byBundleId(id));
    updateTag(CACHE_TAGS.gallery.byParentProductId(id));
    return { success: true, error: null };
  } catch (error) {
    console.error("[updateBundle]", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
