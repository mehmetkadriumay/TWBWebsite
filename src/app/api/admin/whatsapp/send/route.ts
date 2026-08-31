import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

const phonePattern = /^\+[1-9]\d{7,14}$/;
const accountSidPattern = /^AC[0-9a-fA-F]{32}$/;
const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const configuredSender = process.env.TWILIO_WHATSAPP_FROM;
  if (
    !accountSid ||
    !accountSidPattern.test(accountSid) ||
    !authToken ||
    !configuredSender
  ) {
    return NextResponse.json(
      { error: "Twilio WhatsApp ayarları tamamlanmamış." },
      { status: 503 },
    );
  }

  const sender = configuredSender.replace(/^whatsapp:/i, "");
  if (!phonePattern.test(sender)) {
    return NextResponse.json(
      { error: "TWILIO_WHATSAPP_FROM geçerli E.164 biçiminde olmalıdır." },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const attempt = attempts.get(ip);
  if (attempt && attempt.resetAt > now && attempt.count >= 10) {
    return NextResponse.json(
      { error: "Gönderim sınırına ulaşıldı. Lütfen daha sonra tekrar deneyin." },
      { status: 429 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const values = input as Record<string, unknown>;
  const recipient =
    typeof values.recipient === "string"
      ? values.recipient.trim().replace(/^whatsapp:/i, "")
      : "";
  const body = typeof values.body === "string" ? values.body.trim() : "";
  if (!phonePattern.test(recipient)) {
    return NextResponse.json(
      { error: "Alıcı numarası +15551234567 biçiminde olmalıdır." },
      { status: 400 },
    );
  }
  if (!body || body.length > 1600) {
    return NextResponse.json(
      { error: "Mesaj 1 ile 1600 karakter arasında olmalıdır." },
      { status: 400 },
    );
  }

  attempts.set(ip, {
    count: attempt && attempt.resetAt > now ? attempt.count + 1 : 1,
    resetAt: attempt && attempt.resetAt > now ? attempt.resetAt : now + 60_000,
  });

  const form = new URLSearchParams({
    To: `whatsapp:${recipient}`,
    From: `whatsapp:${sender}`,
    Body: body,
  });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
      cache: "no-store",
    },
  );
  const result = (await response.json()) as {
    sid?: string;
    status?: string;
    message?: string;
    code?: number;
  };
  if (!response.ok || !result.sid) {
    return NextResponse.json(
      {
        error: result.message ?? "Twilio mesajı kabul etmedi.",
        code: result.code,
      },
      { status: response.status >= 400 ? response.status : 502 },
    );
  }

  return NextResponse.json({
    message: "WhatsApp mesajı Twilio'ya gönderildi.",
    sid: result.sid,
    status: result.status,
  });
}
