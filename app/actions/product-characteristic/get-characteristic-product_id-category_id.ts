"use server";

import { db } from "@/db/db";
import { eq, and, sql } from "drizzle-orm";
import { productCharacteristicsSchema } from "@/db/schemas/product_characteristic.schema";
import { productCharacteristicValuesSchema } from "@/db/schemas/product_characteristic_values.schema";
import { productCharacteristicProductSchema } from "@/db/schemas/product_characteristic_product.schema";

export async function getCharacteristicsForProduct({
  category_id,
  product_id,
}: {
  category_id: string;
  product_id: string;
}) {
  try {
    const characteristics = await db
      .select({
        id: productCharacteristicsSchema.id,
        name: productCharacteristicsSchema.name,
        is_required: productCharacteristicsSchema.is_required,
        is_multiple: productCharacteristicsSchema.is_multiple,
        in_filter: productCharacteristicsSchema.in_filter,
      })
      .from(productCharacteristicsSchema)
      .where(eq(productCharacteristicsSchema.category_id, category_id));

    if (!characteristics.length) {
      return { success: true, data: [] };
    }

    const characteristicIds = characteristics.map((c) => c.id);

    const values = await db
      .select({
        id: productCharacteristicValuesSchema.id,
        value: productCharacteristicValuesSchema.value,
        characteristic_id: productCharacteristicValuesSchema.characteristic_id,
      })
      .from(productCharacteristicValuesSchema)
      .where(sql`${productCharacteristicValuesSchema.characteristic_id} IN (${characteristicIds})`);

    const productValues = await db
      .select({
        characteristic_id: productCharacteristicProductSchema.characteristic_id,
        value_ids: productCharacteristicProductSchema.value_ids,
      })
      .from(productCharacteristicProductSchema)
      .where(
        and(
          eq(productCharacteristicProductSchema.product_id, product_id),
          sql`${productCharacteristicProductSchema.characteristic_id} IN (${characteristicIds})`,
        ),
      );

    const data = characteristics.map((c) => ({
      ...c,
      values: values.filter((v) => v.characteristic_id === c.id),
      selected_value_ids:
        productValues.find((pv) => pv.characteristic_id === c.id)?.value_ids ?? [],
    }));

    return { success: true, data };
  } catch (error) {
    console.error("getCharacteristicsForProduct error:", error);
    return { success: false, error };
  }
}
