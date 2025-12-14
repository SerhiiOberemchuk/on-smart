"use server";

import { db } from "@/db/db";
import { productsSchema, type Product } from "@/db/schemas/product";
import { eq, and, isNotNull } from "drizzle-orm";
import { updateTag } from "next/cache";
import { deleteFileFromS3 } from "../files/uploadFile";

export async function deleteProductVariant({
  product_variant_id,
}: {
  product_variant_id: Product["id"];
}) {
  try {
    const variants = await db
      .select({
        id: productsSchema.id,
        imgSrc: productsSchema.imgSrc,
        parent_product_id: productsSchema.parent_product_id,
      })
      .from(productsSchema)
      .where(
        and(eq(productsSchema.id, product_variant_id), isNotNull(productsSchema.parent_product_id)),
      )
      .limit(1);

    if (!variants.length) {
      return {
        success: false,
        error: "Variant not found",
      };
    }

    const variant = variants[0];

    await db.delete(productsSchema).where(eq(productsSchema.id, product_variant_id));

    if (variant.imgSrc) {
      await deleteFileFromS3(variant.imgSrc);
    }

    if (variant.parent_product_id) {
      const siblings = await db
        .select({ id: productsSchema.id })
        .from(productsSchema)
        .where(eq(productsSchema.parent_product_id, variant.parent_product_id));

      await db
        .update(productsSchema)
        .set({
          variants: siblings.map((v) => v.id),
          hasVariants: siblings.length > 0,
        })
        .where(eq(productsSchema.id, variant.parent_product_id));
    }

    updateTag("get_all_product");

    return { success: true };
  } catch (error) {
    console.error("[deleteProductVariant]", error);
    return { success: false, error: "Server error" };
  }
}
