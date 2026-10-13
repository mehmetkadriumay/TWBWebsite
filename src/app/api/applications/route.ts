import { NextRequest, NextResponse } from "next/server";
import { createApplicationDocumentToken } from "@/lib/application-document-token";
import { createParticipationApplication } from "@/lib/db";

const attempts = new Map<string, { count: number; resetAt: number }>();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RecaptchaVerification = {
  success: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

async function verifyRecaptcha(
  token: string,
  ip: string,
): Promise<RecaptchaVerification> {
  const secret =
    process.env.RECAPTCHA_SECRET_KEY ??
    process.env.GOOGLE_RECAPTCHA_SECRET_KEY;
  if (!secret) {
    throw new Error("RECAPTCHA_SECRET_KEY is not configured.");
  }
  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (ip !== "local") body.set("remoteip", ip);
  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) {
    throw new Error(`Google reCAPTCHA returned HTTP ${response.status}.`);
  }
  return (await response.json()) as RecaptchaVerification;
}

const requiredFields = {
  turkiye: [
    "teacherFirstName",
    "teacherLastName",
    "teacherEmail",
    "teacherPhone",
    "schoolName",
    "province",
    "principalName",
    "studentCount",
    "ageGroup",
    "englishLevel",
    "consent",
  ],
  us: [
    "applicantFirstName",
    "applicantLastName",
    "applicantEmail",
    "dateOfBirth",
    "state",
    "city",
    "referrerFirstName",
    "referrerLastName",
    "referrerEmail",
    "parentFirstName",
    "parentLastName",
    "parentEmail",
    "parentPhone",
    "consent",
  ],
} as const;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const attempt = attempts.get(ip);
  if (attempt && attempt.resetAt > now && attempt.count >= 5) {
    return NextResponse.json(
      { error: "Çok fazla başvuru gönderildi. Lütfen daha sonra tekrar deneyin." },
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
  const formType = values.formType;
  const locale = values.locale === "en" ? "en" : "tr";
  const rawFields = values.fields;
  const recaptchaToken =
    typeof values.recaptchaToken === "string"
      ? values.recaptchaToken.trim()
      : "";
  if (
    (formType !== "turkiye" && formType !== "us") ||
    !rawFields ||
    typeof rawFields !== "object" ||
    Array.isArray(rawFields)
  ) {
    return NextResponse.json({ error: "Geçersiz başvuru." }, { status: 400 });
  }

  const fields = Object.fromEntries(
    Object.entries(rawFields as Record<string, unknown>).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : "",
    ]),
  );
  if (fields.website) {
    return NextResponse.json({ error: "Geçersiz başvuru." }, { status: 400 });
  }
  delete fields.website;
  delete fields["g-recaptcha-response"];

  if (
    Object.values(fields).some((value) => value.length > 3000) ||
    requiredFields[formType].some((field) => !fields[field])
  ) {
    return NextResponse.json(
      { error: locale === "tr" ? "Lütfen zorunlu alanları doldurun." : "Please complete all required fields." },
      { status: 400 },
    );
  }
  if (!recaptchaToken || recaptchaToken.length > 4096) {
    return NextResponse.json(
      {
        error:
          locale === "tr"
            ? "Lütfen Google reCAPTCHA doğrulamasını tamamlayın."
            : "Please complete the Google reCAPTCHA verification.",
      },
      { status: 400 },
    );
  }

  const emailFields =
    formType === "turkiye"
      ? ["teacherEmail"]
      : ["applicantEmail", "referrerEmail", "parentEmail"];
  if (emailFields.some((field) => !emailPattern.test(fields[field]))) {
    return NextResponse.json(
      { error: locale === "tr" ? "E-posta adreslerinden biri geçersiz." : "One or more email addresses are invalid." },
      { status: 400 },
    );
  }
  if (
    formType === "turkiye" &&
    (!/^\d+$/.test(fields.studentCount) ||
      Number(fields.studentCount) < 1 ||
      Number(fields.studentCount) > 100)
  ) {
    return NextResponse.json(
      { error: locale === "tr" ? "Öğrenci sayısı 1 ile 100 arasında olmalıdır." : "The student count must be between 1 and 100." },
      { status: 400 },
    );
  }

  let recaptcha: RecaptchaVerification;
  try {
    recaptcha = await verifyRecaptcha(recaptchaToken, ip);
  } catch (error) {
    console.error("Google reCAPTCHA verification failed:", error);
    return NextResponse.json(
      {
        error:
          locale === "tr"
            ? "Google reCAPTCHA doğrulaması şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin."
            : "Google reCAPTCHA verification is currently unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }
  if (!recaptcha.success) {
    return NextResponse.json(
      {
        error:
          locale === "tr"
            ? "Google reCAPTCHA doğrulaması başarısız oldu. Lütfen tekrar deneyin."
            : "Google reCAPTCHA verification failed. Please try again.",
      },
      { status: 400 },
    );
  }

  attempts.set(ip, {
    count: attempt && attempt.resetAt > now ? attempt.count + 1 : 1,
    resetAt: attempt && attempt.resetAt > now ? attempt.resetAt : now + 60 * 60 * 1000,
  });
  const applicationId = await createParticipationApplication(
    formType,
    locale,
    fields,
  );
  const documentToken =
    formType === "turkiye"
      ? createApplicationDocumentToken(applicationId)
      : null;

  return NextResponse.json(
    {
      message:
        locale === "tr"
          ? "Başvurunuz alındı. Proje ekibi bilgilerinizi inceleyecektir."
          : "Your application has been received. The project team will review your information.",
      applicationId,
      documentUrl: documentToken
        ? `/api/applications/${applicationId}/document?token=${encodeURIComponent(documentToken)}`
        : null,
      printUrl: documentToken
        ? `/api/applications/${applicationId}/print?token=${encodeURIComponent(documentToken)}`
        : null,
    },
    { status: 201 },
  );
}
