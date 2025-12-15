"use server";

import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { deleteFileFromS3 } from "../files/uploadFile";
import { productDescriptionSchema } from "@/db/schemas/product-details.schema";

export async function deleteProductDescriptionById({ id }: { id: string }) {
  try {
    const response = await db
      .select()
      .from(productDescriptionSchema)
      .where(eq(productDescriptionSchema.product_id, id));
    await db.delete(productDescriptionSchema);
    const images = response[0].images ?? [];
    if (images.length > 0) {
      const res = await Promise.allSettled(response[0].images.map((i) => deleteFileFromS3(i)));

      const errors = res.filter((i) => i.status === "rejected");
      if (errors.length > 0) {
        console.error("[deleteProductDescriptionById] fail to delete foto", errors);
      }
    }
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
