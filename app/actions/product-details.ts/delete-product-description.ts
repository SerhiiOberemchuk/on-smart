"use server";

import { db } from "@/db/db";
import { productDescrizioneSchema } from "@/db/schemas/product-details";
import { eq } from "drizzle-orm";
import { deleteFileFromS3 } from "../files/uploadFile";

export async function deleteProductDescriptionById({ id }: { id: string }) {
  try {
    const response = await db
      .select()
      .from(productDescrizioneSchema)
      .where(eq(productDescrizioneSchema.product_id, id));
    await db.delete(productDescrizioneSchema);
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
