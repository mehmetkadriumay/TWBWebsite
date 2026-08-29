import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieName,
  sessionMaxAge,
  validateCredentials,
} from "@/lib/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 10 * 60 * 1000;
const maxAttempts = 8;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const current = attempts.get(ip);
  if (current && current.resetAt > now && current.count >= maxAttempts) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const { username, password } = payload as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Kullanıcı adı ve şifre gerekli." }, { status: 400 });
  }

  if (!validateCredentials(username, password)) {
    attempts.set(ip, {
      count: current && current.resetAt > now ? current.count + 1 : 1,
      resetAt: current && current.resetAt > now ? current.resetAt : now + windowMs,
    });
    return NextResponse.json(
      { error: "Kullanıcı adı veya şifre hatalı." },
      { status: 401 },
    );
  }

  attempts.delete(ip);
  const response = NextResponse.json({ message: "Giriş başarılı." });
  response.cookies.set(sessionCookieName, createSessionToken(username), {
    httpOnly: true,
    maxAge: sessionMaxAge,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
