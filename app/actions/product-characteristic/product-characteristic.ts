"use server";

import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import {
  productCharacteristicProductSchema,
  ProductCharacteristicProductType,
} from "@/db/schemas/product_characteristic_product.schema";

export async function getProductCharacteristics(product_id: string) {
  try {
    const data = await db
      .select()
      .from(productCharacteristicProductSchema)
      .where(eq(productCharacteristicProductSchema.product_id, product_id));

    return { success: true, data };
  } catch (error) {
    console.error("getProductCharacteristics error:", error);
    return { success: false, error };
  }
}

export async function upsertProductCharacteristic(
  payload: Omit<ProductCharacteristicProductType, "id">,
) {
  // const normalizedValueIds = Array.isArray(payload.value_ids)
  //   ? payload.value_ids
  //   : payload.value_ids
  //     ? [payload.value_ids]
  //     : [];
  try {
    const existing = await db
      .select({ id: productCharacteristicProductSchema.id })
      .from(productCharacteristicProductSchema)
      .where(
        and(
          eq(productCharacteristicProductSchema.product_id, payload.product_id),
          eq(productCharacteristicProductSchema.characteristic_id, payload.characteristic_id),
        ),
      )
      .limit(1);

    if (existing.length) {
      await db
        .update(productCharacteristicProductSchema)
        .set({
          value_ids: payload.value_ids,
          characteristic_name: payload.characteristic_name,
        })
        .where(eq(productCharacteristicProductSchema.id, existing[0].id));
    } else {
      await db.insert(productCharacteristicProductSchema).values({
        product_id: payload.product_id,
        characteristic_id: payload.characteristic_id,
        characteristic_name: payload.characteristic_name,
        value_ids: payload.value_ids,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("upsertProductCharacteristic error:", error);
    return { success: false, error };
  }
}

export async function deleteProductCharacteristic(product_id: string, characteristic_id: string) {
  try {
    await db
      .delete(productCharacteristicProductSchema)
      .where(
        and(
          eq(productCharacteristicProductSchema.product_id, product_id),
          eq(productCharacteristicProductSchema.characteristic_id, characteristic_id),
        ),
      );

    return { success: true };
  } catch (error) {
    console.error("deleteProductCharacteristic error:", error);
    return { success: false, error };
  }
}
