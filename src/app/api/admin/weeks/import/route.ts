import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { replaceWeeks } from "@/lib/db";
import { parseWeeksWorkbook } from "@/lib/import-weeks";

const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Excel dosyası gerekli." }, { status: 400 });
  }
  if (file.size === 0 || file.size > maxFileSize) {
    return NextResponse.json(
      { error: "Dosya boş veya 5 MB sınırından büyük." },
      { status: 400 },
    );
  }
  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    return NextResponse.json(
      { error: "Yalnızca .xlsx veya .xls dosyaları kabul edilir." },
      { status: 400 },
    );
  }

  try {
    const weeks = parseWeeksWorkbook(Buffer.from(await file.arrayBuffer()));
    replaceWeeks(weeks);
    return NextResponse.json({
      message: `${weeks.length} hafta başarıyla içe aktarıldı.`,
      weeks: weeks.map((week) => week.id),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Excel dosyası okunamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
