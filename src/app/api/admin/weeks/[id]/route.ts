import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteWeek } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const id = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Geçersiz hafta." }, { status: 400 });
  }
  if (!(await deleteWeek(id))) {
    return NextResponse.json({ error: "Hafta bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ message: `Hafta ${id} silindi.` });
}
