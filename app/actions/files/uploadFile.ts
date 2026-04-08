"use server";

import { s3 } from "../../../lib/s3-files";
import { CopyObjectCommand, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { ulid } from "ulid";

type ManagedSubBucket = "products" | "bundles" | "brands" | "categories" | "files";

function getManagedBucketHost() {
  const normalizedEndpoint = process.env.S3_ENDPOINT!.replace(/^https?:\/\//, "");
  return `${process.env.S3_BUCKET!}.${normalizedEndpoint}`;
}

function getManagedFileKey(urlFile: string) {
  const parsedUrl = new URL(urlFile);
  const expectedHost = getManagedBucketHost();

  if (parsedUrl.host !== expectedHost) {
    throw new Error("URL is not from managed S3 bucket");
  }

  const fileKey = parsedUrl.pathname.slice(1).trim();
  if (!fileKey) {
    throw new Error("Managed S3 file key is empty");
  }

  return fileKey;
}

function buildManagedFileUrl(fileKey: string) {
  return `https://${getManagedBucketHost()}/${fileKey}`;
}

function extractSubBucketFromKey(fileKey: string): ManagedSubBucket {
  const [subBucket] = fileKey.split("/");

  if (
    subBucket === "products" ||
    subBucket === "bundles" ||
    subBucket === "brands" ||
    subBucket === "categories" ||
    subBucket === "files"
  ) {
    return subBucket;
  }

  throw new Error(`Unsupported S3 sub bucket: ${subBucket}`);
}

function extractExtensionFromKey(fileKey: string) {
  const fileName = fileKey.split("/").pop() ?? "";
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex + 1) : "";
}

function buildCopiedKeyFromSource(fileKey: string) {
  const subBucket = extractSubBucketFromKey(fileKey);
  const extension = extractExtensionFromKey(fileKey);
  return `${subBucket}/${ulid()}${extension ? `.${extension}` : ""}`;
}

export async function uploadFile({
  file,
  sub_bucket,
  imagePreset,
}: {
  file: File;
  sub_bucket: ManagedSubBucket;
  imagePreset?: "default" | "content";
}) {
  const arrayBuffer = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(arrayBuffer);
  let ext = "webp";
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
    ext = file.name.split(".").pop() || ext;
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

  return { fileUrl: buildManagedFileUrl(fileKey), ...response };
}

export async function copyFileInS3(urlFile: string) {
  const sourceKey = getManagedFileKey(urlFile);
  const targetKey = buildCopiedKeyFromSource(sourceKey);

  await s3.send(
    new CopyObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      CopySource: `${process.env.S3_BUCKET!}/${sourceKey}`,
      Key: targetKey,
      ACL: "public-read",
    }),
  );

  return { fileUrl: buildManagedFileUrl(targetKey), sourceKey, targetKey };
}

export async function copyFilesInS3(urls: string[]) {
  const uniqueUrls = Array.from(
    new Set(urls.map((url) => url.trim()).filter(Boolean)),
  );
  const copiedEntries = await Promise.all(
    uniqueUrls.map(async (url) => {
      const response = await copyFileInS3(url);
      return {
        sourceUrl: url,
        fileUrl: response.fileUrl,
      };
    }),
  );

  const urlMap = new Map(copiedEntries.map((entry) => [entry.sourceUrl, entry.fileUrl]));
  return { copiedEntries, urlMap };
}

export async function deleteFileFromS3(urlFile: string) {
  try {
    const fileKeyExtracted = getManagedFileKey(urlFile);
    const respDell = await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: fileKeyExtracted,
      }),
    );

    return { success: true, response: respDell.$metadata };
  } catch (error) {
    if (error instanceof Error && error.message === "URL is not from managed S3 bucket") {
      return {
        success: false,
        skipped: true,
        error: error.message,
      };
    }

    return { success: false, error };
  }
}
