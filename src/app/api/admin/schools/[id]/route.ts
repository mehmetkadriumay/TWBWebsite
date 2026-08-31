import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteSchool, updateSchool } from "@/lib/db";
import { parseSchoolInput } from "@/lib/school-input";

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
    return NextResponse.json({ error: "Geçersiz okul." }, { status: 400 });
  }
  try {
    const school = await updateSchool(
      id,
      parseSchoolInput(await request.json()),
    );
    if (!school) {
      return NextResponse.json({ error: "Okul bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ message: "Okul güncellendi.", school });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Okul güncellenemedi." },
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
    return NextResponse.json({ error: "Geçersiz okul." }, { status: 400 });
  }
  if (!(await deleteSchool(id))) {
    return NextResponse.json({ error: "Okul bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ message: "Okul silindi." });
}
