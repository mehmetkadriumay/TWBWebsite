import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteWeek, updateWeekTopics } from "@/lib/db";

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
    return NextResponse.json({ error: "Geçersiz hafta." }, { status: 400 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const rawTopics =
    input && typeof input === "object"
      ? (input as Record<string, unknown>).topics
      : null;
  if (!Array.isArray(rawTopics) || rawTopics.length > 1000) {
    return NextResponse.json({ error: "Geçersiz konu listesi." }, { status: 400 });
  }
  const topics: Array<{ title: string; question: string }> = [];
  for (const item of rawTopics) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return NextResponse.json({ error: "Geçersiz konu veya soru." }, { status: 400 });
    }
    const value = item as Record<string, unknown>;
    if (typeof value.title !== "string" || typeof value.question !== "string") {
      return NextResponse.json({ error: "Geçersiz konu veya soru." }, { status: 400 });
    }
    const title = value.title.trim();
    const question = value.question.trim();
    if (!title || !question || title.length > 255 || question.length > 3000) {
      return NextResponse.json(
        { error: "Konu başlıkları ve sorular boş bırakılamaz." },
        { status: 400 },
      );
    }
    topics.push({ title, question });
  }

  if (!(await updateWeekTopics(id, topics))) {
    return NextResponse.json({ error: "Hafta bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({
    message: `Hafta ${id} konuları ve soruları kaydedildi.`,
  });
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
    return NextResponse.json({ error: "Geçersiz hafta." }, { status: 400 });
  }
  if (!(await deleteWeek(id))) {
    return NextResponse.json({ error: "Hafta bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ message: `Hafta ${id} silindi.` });
}
