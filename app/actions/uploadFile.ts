"use server";

import { s3 } from "@/lib/s3-files";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { log } from "node:console";

export async function uploadFileAction(
  formData: FormData,
  { sub_bucket }: { sub_bucket: "products" | "brands" | "categories" | "files" },
) {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Файл не передано" };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = file.name.split(".").pop();
  const fileKey = `${sub_bucket}/${Date.now()}.${ext}`;

  const res = await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    }),
  );

  console.log("UPLOAD:", res);

  const url = `https://${process.env.S3_BUCKET!}.${process.env.S3_ENDPOINT!.replace("http://", "")}/${fileKey}`;

  return { url };
}

export async function deleteFileFromS3(urlFile: string) {
  const fileKeyExtracted = new URL(urlFile).pathname.slice(1);

  const respDell = await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET!,

      Key: fileKeyExtracted,
    }),
  );
  log("DELETE:", respDell);
  return respDell;
}
