"use server";

import { ProductType } from "@/db/schemas/product.schema";
import { getProductDocumentsById } from "./get-product-documents";
import { deleteFileFromS3 } from "../files/uploadFile";
import { db } from "@/db/db";
import { productDocumentsSchema } from "@/db/schemas/product-documents.schema";

export async function deleteProductDocuments(id: ProductType["id"]) {
  try {
    const documents = await getProductDocumentsById({ product_id: id });
    await db.delete(productDocumentsSchema);

    if (documents.data?.documents.length) {
      const resp = await Promise.allSettled(
        documents.data.documents.map((i) => deleteFileFromS3(i.link)),
      );
      const faile = resp.filter((i) => i.status === "rejected");
      if (faile.length > 0) {
        console.error("[deleteProductDocuments] faile to delete S3: ", faile);
        return {
          success: true,
          faile,
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
