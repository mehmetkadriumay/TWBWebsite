import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createStudent } from "@/lib/db";
import { parseStudentInput } from "@/lib/student-input";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  try {
    const student = await createStudent(parseStudentInput(await request.json()));
    return NextResponse.json(
      { message: "Öğrenci eklendi.", student },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Öğrenci eklenemedi." },
      { status: 400 },
    );
  }
}
