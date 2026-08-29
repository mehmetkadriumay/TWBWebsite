import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createTemplateWorkbook } from "@/lib/import-weeks";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  return new NextResponse(new Uint8Array(createTemplateWorkbook()), {
    headers: {
      "Content-Disposition": 'attachment; filename="konusma-konulari-ornek.xlsx"',
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
