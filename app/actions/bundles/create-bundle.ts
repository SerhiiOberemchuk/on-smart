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

type CreateBundlePayload = Omit<
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

export async function createBundle(formData: CreateBundlePayload) {
  if (!formData.brand_id) {
    return { success: false, id: "", error: "Select bundle brand" };
  }

  const uniqueProductIds = Array.from(new Set(formData.productIds));

  if (uniqueProductIds.length === 0) {
    return { success: false, id: "", error: "Select at least one product for bundle" };
  }

  if (formData.imgSrc.length === 0) {
    return { success: false, id: "", error: "Upload at least one bundle image" };
  }

  const parsedInStock = Number(formData.inStock);
  if (!Number.isFinite(parsedInStock) || parsedInStock < 0) {
    return { success: false, id: "", error: "Stock must be >= 0" };
  }

  try {
    const category = await db
      .select({
        id: categoryProductsSchema.id,
        category_slug: categoryProductsSchema.category_slug,
      })
      .from(categoryProductsSchema)
      .where(eq(categoryProductsSchema.id, formData.category_id))
      .limit(1);

    if (category.length === 0) {
      return { success: false, id: "", error: "Category not found" };
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
      return { success: false, id: "", error: "Brand not found" };
    }

    const existingSlug = await db
      .select({ id: productsSchema.id })
      .from(productsSchema)
      .where(eq(productsSchema.slug, formData.slug))
      .limit(1);

    if (existingSlug.length > 0) {
      return { success: false, id: "", error: "Bundle slug already exists" };
    }

    const existingProducts = await db
      .select({
        id: productsSchema.id,
        bundleIds: productsSchema.bundleIds,
      })
      .from(productsSchema)
      .where(and(inArray(productsSchema.id, uniqueProductIds), eq(productsSchema.productType, "product")));

    if (existingProducts.length !== uniqueProductIds.length) {
      const existingProductIdsSet = new Set(existingProducts.map((item) => item.id));
      const missingProductIds = uniqueProductIds.filter((item) => !existingProductIdsSet.has(item));

      return {
        success: false,
        id: "",
        error: `Some products were not found: ${missingProductIds.join(", ")}`,
      };
    }

    const normalizedBundleMeta = normalizeBundleMeta(uniqueProductIds, formData.bundleMeta);
    const [firstImage] = formData.imgSrc;
    const galleryImages = formData.imgSrc.slice(1);
    const { brand_id: _brandId, productIds: _productIds, imgSrc: _images, bundleMeta: _bundleMeta, ...bundleData } = formData;

    const payload: ProductInsertType = {
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

    const bundleId = await db.transaction(async (tx) => {
      const result = await tx.insert(productsSchema).values(payload).$returningId();
      const insertedBundleId = result[0]?.id;

      if (!insertedBundleId) {
        throw new Error("Failed to create bundle");
      }

      for (const product of existingProducts) {
        const nextBundleIds = Array.from(new Set([...(product.bundleIds ?? []), insertedBundleId]));
        await tx
          .update(productsSchema)
          .set({
            bundleIds: nextBundleIds,
          })
          .where(eq(productsSchema.id, product.id));
      }

      await tx.insert(bundleMetaSchema).values({
        bundle_id: insertedBundleId,
        includedProducts: normalizedBundleMeta.includedProducts,
        advantages: normalizedBundleMeta.advantages,
        description: normalizedBundleMeta.description,
      });

      if (galleryImages.length > 0) {
        await tx.insert(productFotoGallery).values({
          parent_product_id: insertedBundleId,
          images: galleryImages,
        });
      }

      return insertedBundleId;
    });

    if (!bundleId) {
      return { success: false, id: "", error: "Failed to create bundle" };
    }

    updateTag(CACHE_TAGS.bundle.all);
    updateTag(CACHE_TAGS.bundle.byId(bundleId));
    updateTag(CACHE_TAGS.bundle.bySlug(formData.slug));
    updateTag(CACHE_TAGS.product.all);
    updateTag(CACHE_TAGS.bundleMeta.byBundleId(bundleId));
    updateTag(CACHE_TAGS.gallery.byParentProductId(bundleId));
    return { success: true, id: bundleId, error: null };
  } catch (error) {
    console.error("[createBundle]", error);
    return {
      success: false,
      id: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
