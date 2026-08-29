import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteStudent, updateStudent } from "@/lib/db";
import { parseStudentInput } from "@/lib/student-input";

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
    return NextResponse.json({ error: "Geçersiz öğrenci." }, { status: 400 });
  }
  try {
    const student = updateStudent(id, parseStudentInput(await request.json()));
    if (!student) {
      return NextResponse.json({ error: "Öğrenci bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ message: "Öğrenci güncellendi.", student });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Öğrenci güncellenemedi." },
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
    return NextResponse.json({ error: "Geçersiz öğrenci." }, { status: 400 });
  }
  if (!deleteStudent(id)) {
    return NextResponse.json({ error: "Öğrenci bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ message: "Öğrenci silindi." });
}
