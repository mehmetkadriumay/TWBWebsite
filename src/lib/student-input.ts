import type { StudentInput } from "@/lib/types";

function text(
  input: Record<string, unknown>,
  key: string,
  required = false,
): string {
  const value = input[key];
  if (typeof value !== "string") {
    throw new Error(`Geçersiz öğrenci alanı: ${key}.`);
  }
  const normalized = value.trim();
  if ((required && !normalized) || normalized.length > 3000) {
    throw new Error(`Geçersiz öğrenci alanı: ${key}.`);
  }
  return normalized;
}

export function parseStudentInput(value: unknown): StudentInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Geçersiz öğrenci bilgisi.");
  }
  const input = value as Record<string, unknown>;
  if (
    (input.studentType !== "foreign" && input.studentType !== "turkish") ||
    typeof input.projectLeader !== "boolean"
  ) {
    throw new Error("Öğrenci türü veya proje lideri alanı geçersiz.");
  }

  if (input.studentType === "foreign") {
    return {
      studentType: "foreign",
      applicantFirstName: text(input, "applicantFirstName", true),
      applicantLastName: text(input, "applicantLastName", true),
      applicantEmail: text(input, "applicantEmail", true),
      dateOfBirth: text(input, "dateOfBirth"),
      state: text(input, "state", true),
      city: text(input, "city", true),
      referrerFirstName: text(input, "referrerFirstName"),
      referrerLastName: text(input, "referrerLastName"),
      referrerEmail: text(input, "referrerEmail"),
      parentFirstName: text(input, "parentFirstName"),
      parentLastName: text(input, "parentLastName"),
      parentEmail: text(input, "parentEmail"),
      parentPhone: text(input, "parentPhone"),
      details: text(input, "details"),
      projectLeader: input.projectLeader,
    };
  }

  return {
    studentType: "turkish",
    teacherFirstName: text(input, "teacherFirstName", true),
    teacherLastName: text(input, "teacherLastName", true),
    teacherEmail: text(input, "teacherEmail", true),
    teacherPhone: text(input, "teacherPhone"),
    schoolName: text(input, "schoolName", true),
    province: text(input, "province", true),
    district: text(input, "district"),
    principalName: text(input, "principalName"),
    studentCount: text(input, "studentCount"),
    ageGroup: text(input, "ageGroup"),
    englishLevel: text(input, "englishLevel"),
    details: text(input, "details"),
    projectLeader: input.projectLeader,
  };
}
