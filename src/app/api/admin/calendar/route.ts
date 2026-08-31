import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { updateAcademicCalendar } from "@/lib/db";
import type { AcademicCalendar } from "@/lib/types";

const keys: Array<keyof AcademicCalendar> = [
  "semester1Start",
  "semester1End",
  "semester2Start",
  "semester2End",
];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const values = body as Record<string, unknown>;
  if (keys.some((key) => typeof values[key] !== "string" || !datePattern.test(String(values[key])))) {
    return NextResponse.json({ error: "Dört geçerli tarih gereklidir." }, { status: 400 });
  }
  const calendar = Object.fromEntries(
    keys.map((key) => [key, String(values[key])]),
  ) as AcademicCalendar;
  if (
    calendar.semester1Start > calendar.semester1End ||
    calendar.semester1End >= calendar.semester2Start ||
    calendar.semester2Start > calendar.semester2End
  ) {
    return NextResponse.json(
      { error: "Dönem tarihleri kronolojik sırada olmalıdır." },
      { status: 400 },
    );
  }
  await updateAcademicCalendar(calendar);
  return NextResponse.json({ message: "Dönem tarihleri kaydedildi." });
}
