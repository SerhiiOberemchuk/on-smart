"use server";

import { s3 } from "@/lib/s3-files";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { ulid } from "ulid";

export async function uploadFile({
  file,
  sub_bucket,
}: {
  file: File;
  sub_bucket: "products" | "brands" | "categories" | "files";
}) {
  const arrayBuffer = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(arrayBuffer);
  let ext: string = "webp";
  // ext = file.name.split(".").pop()!;
  if (sub_bucket === "categories" || sub_bucket === "products") {
    buffer = await sharp(buffer)
      .resize({ width: 326, height: 326, fit: "cover", position: "center" })
      .webp({ quality: 100 })
      .toBuffer();
  } else if (sub_bucket === "brands") {
    buffer = await sharp(buffer).webp({ quality: 100, lossless: true }).toBuffer();
  } else {
    ext = file.name.split(".").pop()!;
  }

  const fileKey = `${sub_bucket}/${ulid()}.${ext}`;

  const response = await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    }),
  );

  const fileUrl = `https://${process.env.S3_BUCKET!}.${process.env.S3_ENDPOINT!.replace("http://", "")}/${fileKey}`;

  return { fileUrl, ...response };
}

export async function deleteFileFromS3(urlFile: string) {
  const fileKeyExtracted = new URL(urlFile).pathname.slice(1);
  try {
    const respDell = await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,

        Key: fileKeyExtracted,
      }),
    );

    return { success: true, response: respDell.$metadata };
  } catch (error) {
    return { success: false, error };
  }
}
