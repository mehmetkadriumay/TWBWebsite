import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getPage, updatePage } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const { slug } = await params;
  const existing = await getPage(slug);
  if (!existing) {
    return NextResponse.json({ error: "Sayfa bulunamadı." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const values = body as Record<string, unknown>;
  for (const field of ["title", "eyebrow", "summary", "body"]) {
    if (
      typeof values[field] !== "string" ||
      String(values[field]).trim().length === 0 ||
      String(values[field]).length > 12_000
    ) {
      return NextResponse.json(
        { error: `${field} alanı geçersiz.` },
        { status: 400 },
      );
    }
  }

  await updatePage({
    slug,
    title: String(values.title).trim(),
    eyebrow: String(values.eyebrow).trim(),
    summary: String(values.summary).trim(),
    body: String(values.body).trim(),
  });
  return NextResponse.json({
    message: "İçerik yayımlandı.",
    page: {
      slug,
      title: String(values.title).trim(),
      eyebrow: String(values.eyebrow).trim(),
      summary: String(values.summary).trim(),
      body: String(values.body).trim(),
    },
  });
}
