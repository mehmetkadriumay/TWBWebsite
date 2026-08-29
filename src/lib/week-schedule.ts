import type { AcademicCalendar } from "@/lib/types";

const dayMs = 24 * 60 * 60 * 1000;
const weekMs = 7 * dayMs;

function parseDate(value: string): Date {
  return new Date(`${value}T12:00:00Z`);
}

function weeksInRange(start: string, end: string): number {
  return Math.floor((parseDate(end).getTime() - parseDate(start).getTime()) / weekMs) + 1;
}

export function getWeekDate(
  weekNumber: number,
  calendar: AcademicCalendar,
): Date | null {
  const semester1Weeks = weeksInRange(
    calendar.semester1Start,
    calendar.semester1End,
  );
  const inSemester1 = weekNumber <= semester1Weeks;
  const offset = inSemester1 ? weekNumber - 1 : weekNumber - semester1Weeks - 1;
  const start = parseDate(
    inSemester1 ? calendar.semester1Start : calendar.semester2Start,
  );
  const end = parseDate(
    inSemester1 ? calendar.semester1End : calendar.semester2End,
  );
  const date = new Date(start.getTime() + offset * weekMs);
  return date <= end ? date : null;
}

export function formatWeekDate(date: Date, locale: "tr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
