import type { StudentInput } from "@/lib/types";

export function parseStudentInput(value: unknown): StudentInput {
  if (!value || typeof value !== "object") {
    throw new Error("Geçersiz öğrenci bilgisi.");
  }
  const input = value as Record<string, unknown>;
  if (
    typeof input.studentName !== "string" ||
    typeof input.schoolOrCoordinatorRegion !== "string" ||
    (input.role !== "facilitator" && input.role !== "student") ||
    typeof input.projectLeader !== "boolean"
  ) {
    throw new Error("Öğrenci alanları geçersiz.");
  }
  const student: StudentInput = {
    studentName: input.studentName.trim(),
    schoolOrCoordinatorRegion: input.schoolOrCoordinatorRegion.trim(),
    role: input.role,
    projectLeader: input.projectLeader,
  };
  if (
    !student.studentName ||
    !student.schoolOrCoordinatorRegion ||
    student.studentName.length > 200 ||
    student.schoolOrCoordinatorRegion.length > 200
  ) {
    throw new Error("Öğrenci adı ve okul veya koordinatör bölgesi gereklidir.");
  }
  return student;
}
