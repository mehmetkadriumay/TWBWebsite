import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getWeeks } from "@/lib/db";
import { createWeeksWorkbook } from "@/lib/import-weeks";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const weeks = getWeeks();
  if (weeks.length === 0) {
    return NextResponse.json(
      { error: "Dışa aktarılacak hafta bulunamadı." },
      { status: 404 },
    );
  }
  return new NextResponse(new Uint8Array(createWeeksWorkbook(weeks)), {
    headers: {
      "Content-Disposition":
        'attachment; filename="tum-haftalar-konusma-konulari.xlsx"',
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Cache-Control": "no-store",
    },
  });
}
