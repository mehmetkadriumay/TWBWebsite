import "server-only";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const maximumImageSize = 5 * 1024 * 1024;
const imageTypes = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type StoredImageType = keyof typeof imageTypes;

export function uploadDirectory(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  return configured
    ? path.resolve(configured)
    : path.join(process.cwd(), "public", "assets");
}

function hasValidSignature(buffer: Buffer, type: StoredImageType): boolean {
  if (type === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8;
  }
  if (type === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      )
    );
  }
  if (type === "image/gif") {
    const signature = buffer.subarray(0, 6).toString("ascii");
    return signature === "GIF87a" || signature === "GIF89a";
  }
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export async function storeImage(file: File): Promise<string> {
  if (!(file.type in imageTypes)) {
    throw new Error("Only JPEG, PNG, GIF, and WebP images can be uploaded.");
  }
  if (file.size === 0 || file.size > maximumImageSize) {
    throw new Error("Images must be between 1 byte and 5 MB.");
  }
  const type = file.type as StoredImageType;
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(buffer, type)) {
    throw new Error("The selected file is not a valid image.");
  }
  const filename = `${Date.now()}-${randomUUID()}.${imageTypes[type]}`;
  const directory = uploadDirectory();
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), buffer, { flag: "wx" });
  return filename;
}

export function validStoredImageName(value: string): boolean {
  return /^\d{13}-[0-9a-f-]{36}\.(gif|jpe?g|png|webp)$/i.test(value);
}

export function storedImageContentType(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".gif") return "image/gif";
  return "image/webp";
}
