import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteNews, updateNews } from "@/lib/db";
import { parseNewsInput } from "@/lib/news-input";

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Geçersiz haber." }, { status: 400 });
  }
  try {
    const news = await updateNews(id, parseNewsInput(await request.json()));
    if (!news) {
      return NextResponse.json({ error: "Haber bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ message: "Haber güncellendi.", news });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Haber güncellenemedi." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Geçersiz haber." }, { status: 400 });
  }
  if (!(await deleteNews(id))) {
    return NextResponse.json({ error: "Haber bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ message: "Haber silindi." });
}
