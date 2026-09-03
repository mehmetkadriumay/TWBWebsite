import { NextRequest, NextResponse } from "next/server";
import { createParticipationApplication } from "@/lib/db";

const attempts = new Map<string, { count: number; resetAt: number }>();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
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

  if (
    Object.values(fields).some((value) => value.length > 3000) ||
    requiredFields[formType].some((field) => !fields[field])
  ) {
    return NextResponse.json(
      { error: locale === "tr" ? "Lütfen zorunlu alanları doldurun." : "Please complete all required fields." },
      { status: 400 },
    );
  }
  if (fields.humanVerification !== "yes") {
    return NextResponse.json(
      {
        error:
          locale === "tr"
            ? "Lütfen insan doğrulamasını tamamlayın."
            : "Please complete the human verification.",
      },
      { status: 400 },
    );
  }
  delete fields.humanVerification;

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

  attempts.set(ip, {
    count: attempt && attempt.resetAt > now ? attempt.count + 1 : 1,
    resetAt: attempt && attempt.resetAt > now ? attempt.resetAt : now + 60 * 60 * 1000,
  });
  await createParticipationApplication(formType, locale, fields);

  return NextResponse.json(
    {
      message:
        locale === "tr"
          ? "Başvurunuz alındı. Proje ekibi bilgilerinizi inceleyecektir."
          : "Your application has been received. The project team will review your information.",
    },
    { status: 201 },
  );
}
