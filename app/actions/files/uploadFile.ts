"use server";

import { s3 } from "@/lib/s3-files";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { ulid } from "ulid";

export async function uploadFile({
  file,
  sub_bucket,
  imagePreset,
}: {
  file: File;
  sub_bucket: "products" | "bundles" | "brands" | "categories" | "files";
  imagePreset?: "default" | "content";
}) {
  const arrayBuffer = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(arrayBuffer);
  let ext: string = "webp";
  // ext = file.name.split(".").pop()!;
  const effectivePreset = imagePreset ?? "default";

  if (sub_bucket === "categories" || sub_bucket === "products" || sub_bucket === "bundles") {
    if (effectivePreset === "content") {
      buffer = await sharp(buffer)
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 90 })
        .toBuffer();
    } else {
      buffer = await sharp(buffer)
        .resize({ width: 532, height: 532, fit: "cover", position: "center" })
        .webp({ quality: 100 })
        .toBuffer();
    }
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

  const normalizedEndpoint = process.env.S3_ENDPOINT!.replace(/^https?:\/\//, "");
  const fileUrl = `https://${process.env.S3_BUCKET!}.${normalizedEndpoint}/${fileKey}`;

  return { fileUrl, ...response };
}

export async function deleteFileFromS3(urlFile: string) {
  const normalizedEndpoint = process.env.S3_ENDPOINT!.replace(/^https?:\/\//, "");
  const expectedHost = `${process.env.S3_BUCKET!}.${normalizedEndpoint}`;
  const parsedUrl = new URL(urlFile);

  if (parsedUrl.host !== expectedHost) {
    return {
      success: false,
      skipped: true,
      error: "URL is not from managed S3 bucket",
    };
  }

  const fileKeyExtracted = parsedUrl.pathname.slice(1);
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
