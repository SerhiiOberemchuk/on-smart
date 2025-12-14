"use server";

import { db } from "@/db/db";
import { productDescriptionSchema, ProductDescriptionType } from "@/db/schemas/product-details";

export async function createProductDescriptionById(props: ProductDescriptionType) {
  try {
    await db.insert(productDescriptionSchema).values(props);

    return {
      success: true,
      data: "Created",
    };
  } catch (error) {
    return { error, success: false };
  }
}
