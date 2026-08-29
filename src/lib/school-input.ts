import type { SchoolInput } from "@/lib/types";

const fields: Array<keyof SchoolInput> = [
  "schoolName",
  "coordinatorName",
  "responsibleTeacherName",
  "foreignStudentIds",
  "turkishStudentIds",
  "coordinatorWhatsappGroupName",
  "studentWhatsappGroupName",
  "meetingLink",
];

export function parseSchoolInput(value: unknown): SchoolInput {
  if (!value || typeof value !== "object") {
    throw new Error("Geçersiz okul bilgisi.");
  }
  const input = value as Record<string, unknown>;
  const studentFields: Array<keyof SchoolInput> = [
    "foreignStudentIds",
    "turkishStudentIds",
  ];
  const textFields = fields.filter((field) => !studentFields.includes(field));
  if (
    textFields.some((field) => typeof input[field] !== "string") ||
    studentFields.some(
      (field) =>
        !Array.isArray(input[field]) ||
        !(input[field] as unknown[]).every(
          (id) => Number.isInteger(id) && Number(id) > 0,
        ),
    )
  ) {
    throw new Error("Okul alanları geçersiz.");
  }
  const school = {
    ...Object.fromEntries(
      textFields.map((field) => [field, String(input[field]).trim()]),
    ),
    foreignStudentIds: [...new Set(input.foreignStudentIds as number[])],
    turkishStudentIds: [...new Set(input.turkishStudentIds as number[])],
  } as SchoolInput;
  if (!school.schoolName || school.schoolName.length > 200) {
    throw new Error("Geçerli bir okul adı gereklidir.");
  }
  if (
    textFields.some((field) => String(school[field]).length > 10_000) ||
    (school.meetingLink &&
      !/^https?:\/\/[^\s]+$/i.test(school.meetingLink))
  ) {
    throw new Error("Bir alan çok uzun veya toplantı bağlantısı geçersiz.");
  }
  return school;
}
