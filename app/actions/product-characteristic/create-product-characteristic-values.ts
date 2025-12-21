"use server";

import { db } from "@/db/db";
import {
  productCharacteristicValuesSchema,
  ProductCharacteristicValuesType,
} from "@/db/schemas/product_characteristic_values.schema";

export async function createProductCharacteristicValues(
  params: Omit<ProductCharacteristicValuesType, "id">,
) {
  try {
    await db.insert(productCharacteristicValuesSchema).values(params);
    return { success: true };
  } catch (error) {
    return { error, success: false };
  }
}
