import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  storedImageContentType,
  uploadDirectory,
  validStoredImageName,
} from "@/lib/image-storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!validStoredImageName(filename)) {
    return new NextResponse("Image not found.", { status: 404 });
  }
  try {
    const image = await fs.readFile(path.join(uploadDirectory(), filename));
    return new NextResponse(new Uint8Array(image), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": storedImageContentType(filename),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (code !== "ENOENT") console.error("Stored image read failed:", error);
    return new NextResponse("Image not found.", { status: 404 });
  }
}
