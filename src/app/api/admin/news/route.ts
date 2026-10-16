import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createNews } from "@/lib/db";
import { parseNewsInput } from "@/lib/news-input";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }
  try {
    const news = await createNews(parseNewsInput(await request.json()));
    return NextResponse.json(
      { message: "İçerik eklendi.", news },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "İçerik eklenemedi." },
      { status: 400 },
    );
  }
}
