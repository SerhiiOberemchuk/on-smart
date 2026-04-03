"use server";

import { db } from "@/db/db";
import { productsSchema, type ProductType } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import slugify from "@sindresorhus/slugify";
import { ulid } from "ulid";
import { updateTag } from "next/cache";

export async function createProductVariant({
  parentId,
  newData,
}: {
  parentId: ProductType["id"];
    newData: {
      name: string;
      nameFull: string;
      ean: string;
      searchKeywords?: string[];
      lengthCm: string;
      widthCm: string;
      heightCm: string;
    weightKg: string;
    price: string;
    oldPrice: string | null;
    inStock: number;
    isOnOrder: boolean;
    imgSrc: string;
    category_id: string;
  };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const hasValue = (value: unknown) => value !== null && value !== undefined && `${value}`.trim() !== "";
    if (
      !hasValue(newData.ean) ||
      !hasValue(newData.lengthCm) ||
      !hasValue(newData.widthCm) ||
      !hasValue(newData.heightCm) ||
      !hasValue(newData.weightKg)
    ) {
      return { success: false, error: "EAN, dimensions and weight are required" };
    }

    const parentRows = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.id, parentId));

    if (!parentRows.length) {
      return { success: false, error: "Parent product not found" };
    }

    const parent = parentRows[0];

    const children = await db
      .select({ slug: productsSchema.slug })
      .from(productsSchema)
      .where(eq(productsSchema.parent_product_id, parentId));

    const numbers = children
      .map((c) => {
        const m = c.slug.match(/-v(\d+)$/);
        return m ? Number(m[1]) : null;
      })
      .filter((n): n is number => n !== null);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    const baseSlug = `${parent.slug}-${slugify(newData.nameFull)}`;
    const variantSlug = `${baseSlug}-v${nextNumber}`;

    const newId = ulid();

    const insertData: typeof productsSchema.$inferInsert = {
      id: newId,
      slug: variantSlug,

      name: newData.name,
      nameFull: newData.nameFull,
      ean: newData.ean.trim(),
      lengthCm: newData.lengthCm,
      widthCm: newData.widthCm,
      heightCm: newData.heightCm,
      weightKg: newData.weightKg,
      price: newData.price,
      oldPrice: newData.oldPrice,
      inStock: newData.inStock,
      isOnOrder: newData.isOnOrder,
      imgSrc: newData.imgSrc,
      category_id: newData.category_id,
      brand_slug: parent.brand_slug,
      category_slug: parent.category_slug,

      parent_product_id: parentId,
      variants: [],
      hasVariants: false,
      searchKeywords: Array.from(
        new Set((newData.searchKeywords ?? []).map((item) => item.trim()).filter(Boolean)),
      ),

      rating: "5.0",
    };

    await db.insert(productsSchema).values(insertData);

    const updatedVariants = [...(parent.variants ?? []), newId];

    await db
      .update(productsSchema)
      .set({
        hasVariants: true,
        variants: updatedVariants,
      })
      .where(eq(productsSchema.id, parentId));

    updateTag(CACHE_TAGS.product.all);
    updateTag(CACHE_TAGS.product.byId(parentId));
    updateTag(CACHE_TAGS.product.byId(newId));
    updateTag(CACHE_TAGS.product.bySlug(parent.slug));
    updateTag(CACHE_TAGS.product.bySlug(variantSlug));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Server error" };
  }
}
