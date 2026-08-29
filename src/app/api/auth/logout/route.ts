import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export function POST() {
  const response = NextResponse.json({ message: "Çıkış yapıldı." });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  });
  return response;
}
