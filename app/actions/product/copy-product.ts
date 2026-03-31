"use server";

import { db } from "@/db/db";
import { productDescriptionSchema } from "@/db/schemas/product-details.schema";
import { productDocumentsSchema } from "@/db/schemas/product-documents.schema";
import { productFotoGallery } from "@/db/schemas/product-foto-gallery.schema";
import { productSpecificheSchema } from "@/db/schemas/product-specifiche.schema";
import {
  productCharacteristicProductSchema,
  type ProductCharacteristicProductType,
} from "@/db/schemas/product_characteristic_product.schema";
import { productsSchema, type ProductInsertType } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import {
  buildCopyName,
  buildUniqueCopySlugWithResolver,
  canCopyProduct,
} from "./copy-product.helpers";

function normalizeNullableDecimal(
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeJsonStringValue(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === "string" ? parsed : trimmed;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

async function buildUniqueCopySlug(baseSlug: string): Promise<string> {
  return buildUniqueCopySlugWithResolver(baseSlug, async (candidate) => {
    const [existing] = await db
      .select({ id: productsSchema.id })
      .from(productsSchema)
      .where(eq(productsSchema.slug, candidate))
      .limit(1);

    return Boolean(existing);
  });
}

async function buildUniqueCopyNames(sourceName: string, sourceNameFull: string) {
  let counter = 1;

  while (counter < 1000) {
    const nameCandidate = buildCopyName(sourceName, counter);
    const nameFullCandidate = buildCopyName(sourceNameFull, counter);

    const [existing] = await db
      .select({ id: productsSchema.id })
      .from(productsSchema)
      .where(and(eq(productsSchema.name, nameCandidate), eq(productsSchema.nameFull, nameFullCandidate)))
      .limit(1);

    if (!existing) {
      return { name: nameCandidate, nameFull: nameFullCandidate };
    }

    counter += 1;
  }

  throw new Error("Unable to generate unique names for product copy");
}

export async function copyProductById(sourceProductId: string) {
  if (!sourceProductId) {
    return { success: false, id: "", error: "Product id is required" };
  }

  try {
    const [sourceProduct] = await db
      .select()
      .from(productsSchema)
      .where(and(eq(productsSchema.id, sourceProductId), eq(productsSchema.productType, "product")))
      .limit(1);

    if (!sourceProduct) {
      return { success: false, id: "", error: "Source product not found" };
    }

    if (!canCopyProduct(sourceProduct)) {
      return {
        success: false,
        id: "",
        error: "Copy is allowed only for parent products",
      };
    }

    const [sourceGalleryRows, sourceDescriptionRows, sourceSpecificheRows, sourceDocumentsRows, sourceCharacteristics] =
      await Promise.all([
        db
          .select()
          .from(productFotoGallery)
          .where(eq(productFotoGallery.parent_product_id, sourceProductId))
          .limit(1),
        db
          .select()
          .from(productDescriptionSchema)
          .where(eq(productDescriptionSchema.product_id, sourceProductId))
          .limit(1),
        db
          .select()
          .from(productSpecificheSchema)
          .where(eq(productSpecificheSchema.product_id, sourceProductId))
          .limit(1),
        db
          .select()
          .from(productDocumentsSchema)
          .where(eq(productDocumentsSchema.product_id, sourceProductId))
          .limit(1),
        db
          .select()
          .from(productCharacteristicProductSchema)
          .where(eq(productCharacteristicProductSchema.product_id, sourceProductId)),
      ]);
    const sourceGallery = sourceGalleryRows[0];
    const sourceDescription = sourceDescriptionRows[0];
    const sourceSpecifiche = sourceSpecificheRows[0];
    const sourceDocuments = sourceDocumentsRows[0];

    const nextSlug = await buildUniqueCopySlug(sourceProduct.slug);
    const nextNames = await buildUniqueCopyNames(sourceProduct.name, sourceProduct.nameFull);

    const { id: _sourceId, ...sourceProductWithoutId } = sourceProduct;

    const payload: ProductInsertType = {
      ...sourceProductWithoutId,
      slug: nextSlug,
      name: nextNames.name,
      nameFull: nextNames.nameFull,
      imgSrc: normalizeJsonStringValue(sourceProduct.imgSrc),
      oldPrice: normalizeNullableDecimal(sourceProduct.oldPrice),
      rating: normalizeNullableDecimal(sourceProduct.rating) ?? "5.0",
      hasVariants: false,
      variants: [],
      relatedProductIds: sourceProduct.relatedProductIds ?? [],
      parent_product_id: null,
      bundleIds: [],
    };

    const copiedProductId = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(productsSchema).values(payload).$returningId();
      const newProductId = inserted?.id;

      if (!newProductId) {
        throw new Error("Failed to copy product");
      }

      if (sourceGallery) {
        await tx.insert(productFotoGallery).values({
          parent_product_id: newProductId,
          images: sourceGallery.images,
        });
      }

      if (sourceDescription) {
        await tx.insert(productDescriptionSchema).values({
          product_id: newProductId,
          title: sourceDescription.title,
          description: sourceDescription.description,
          images: sourceDescription.images,
        });
      }

      if (sourceSpecifiche) {
        await tx.insert(productSpecificheSchema).values({
          product_id: newProductId,
          title: sourceSpecifiche.title,
          images: sourceSpecifiche.images,
          groups: sourceSpecifiche.groups,
        });
      }

      if (sourceDocuments) {
        await tx.insert(productDocumentsSchema).values({
          product_id: newProductId,
          documents: sourceDocuments.documents,
        });
      }

      if (sourceCharacteristics.length > 0) {
        const rowsToInsert: Array<Omit<ProductCharacteristicProductType, "id">> =
          sourceCharacteristics.map((row) => ({
            product_id: newProductId,
            characteristic_id: row.characteristic_id,
            characteristic_name: row.characteristic_name,
            value_ids: row.value_ids,
          }));

        await tx.insert(productCharacteristicProductSchema).values(rowsToInsert);
      }

      return newProductId;
    });

    updateTag(CACHE_TAGS.product.all);
    updateTag(CACHE_TAGS.product.byId(copiedProductId));
    updateTag(CACHE_TAGS.product.bySlug(nextSlug));
    updateTag(CACHE_TAGS.product.supportById(copiedProductId));
    updateTag(CACHE_TAGS.product.details.byId(copiedProductId));
    updateTag(CACHE_TAGS.product.details.all);
    updateTag(CACHE_TAGS.gallery.byParentProductId(copiedProductId));

    return { success: true, id: copiedProductId, error: null };
  } catch (error) {
    return {
      success: false,
      id: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
