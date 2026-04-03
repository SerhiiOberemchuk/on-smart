"use server";

import { db } from "@/db/db";
import { productsSchema, type ProductType } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { deleteFileFromS3 } from "../files/uploadFile";

export async function deleteProductVariant({
  product_variant_id,
}: {
  product_variant_id: ProductType["id"];
}) {
  try {
    const variant = await db.transaction(async (tx) => {
      const variantProduct = await tx
        .select()
        .from(productsSchema)
        .where(eq(productsSchema.id, product_variant_id));

      if (!variantProduct.length) {
        return null;
      }

      const currentVariant = variantProduct[0];

      if (currentVariant.parent_product_id) {
        const parentRows = await tx
          .select()
          .from(productsSchema)
          .where(eq(productsSchema.id, currentVariant.parent_product_id));

        const parent = parentRows[0];
        if (parent?.variants?.length) {
          const newVariants = parent.variants.filter((id) => id !== product_variant_id);
          await tx
            .update(productsSchema)
            .set({
              variants: newVariants,
              hasVariants: newVariants.length > 0,
            })
            .where(eq(productsSchema.id, currentVariant.parent_product_id));
        }
      }

      await tx.delete(productsSchema).where(eq(productsSchema.id, currentVariant.id));

      return currentVariant;
    });

    if (!variant) {
      return {
        success: false,
        error: "Variant not found",
      };
    }

    if (variant.imgSrc) {
      try {
        await deleteFileFromS3(variant.imgSrc);
      } catch (error) {
        console.error("[deleteProductVariant] S3 cleanup failed:", error);
      }
    }

    updateTag(CACHE_TAGS.product.all);
    updateTag(CACHE_TAGS.product.byId(variant.id));
    updateTag(CACHE_TAGS.product.bySlug(variant.slug));
    if (variant.parent_product_id) {
      updateTag(CACHE_TAGS.product.byId(variant.parent_product_id));
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteProductVariant]", error);
    return { success: false, error: "Server error" };
  }
}
