import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { storeImage } from "@/lib/image-storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 6 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Görsel en fazla 5 MB olabilir." },
      { status: 413 },
    );
  }
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Yüklenecek görsel bulunamadı." },
        { status: 400 },
      );
    }
    const filename = await storeImage(file);
    return NextResponse.json(
      {
        message: "Görsel yüklendi.",
        url: `/api/uploads/${encodeURIComponent(filename)}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Görsel yüklenemedi.",
      },
      { status: 400 },
    );
  }
}
