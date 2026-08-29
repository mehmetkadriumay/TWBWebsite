import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createSchool } from "@/lib/db";
import { parseSchoolInput } from "@/lib/school-input";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  try {
    const school = createSchool(parseSchoolInput(await request.json()));
    return NextResponse.json(
      { message: "Okul eklendi.", school },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Okul eklenemedi." },
      { status: 400 },
    );
  }
}
