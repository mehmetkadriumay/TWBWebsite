import { NextResponse } from "next/server";
import type { Locale } from "@/lib/i18n";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const locale = (body as { locale?: Locale }).locale;
  if (locale !== "tr" && locale !== "en") {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }
  const response = NextResponse.json({ locale });
  response.cookies.set("twb_locale", locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
