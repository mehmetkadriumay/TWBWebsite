import * as XLSX from "xlsx";
import type { ImportedWeek } from "@/lib/db";

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/\s+/g, " ");

function findValue(
  row: Record<string, unknown>,
  aliases: string[],
): unknown {
  const key = Object.keys(row).find((candidate) =>
    aliases.includes(normalize(candidate)),
  );
  return key ? row[key] : undefined;
}

function parseWeekNumber(value: unknown, sheetName: string): number | null {
  const direct = Number.parseInt(String(value ?? ""), 10);
  if (Number.isInteger(direct) && direct > 0) return direct;
  const fromSheet = sheetName.match(/\d+/)?.[0];
  return fromSheet ? Number.parseInt(fromSheet, 10) : null;
}

function parseSheetTitle(sheetName: string, id: number): string {
  const title = sheetName
    .replace(new RegExp(`^\\s*(hafta|week)\\s*${id}\\s*[-–—:]?\\s*`, "i"), "")
    .trim();
  return title || `Hafta ${id}`;
}

export function parseWeeksWorkbook(buffer: Buffer): ImportedWeek[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const collected = new Map<number, ImportedWeek>();

  for (const sheetName of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[sheetName],
      { defval: "" },
    );

    for (const row of rows) {
      const id = parseWeekNumber(
        findValue(row, ["hafta", "week", "hafta no", "week no"]),
        sheetName,
      );
      const question = String(
        findValue(row, [
          "soru",
          "question",
          "konusma konusu",
          "prompt",
        ]) ?? "",
      ).trim();

      if (!id || !question) continue;

      const title =
        String(
          findValue(row, [
            "baslik",
            "title",
            "hafta basligi",
            "topic",
            "konu",
          ]) ?? "",
        ).trim() || parseSheetTitle(sheetName, id);
      const category = String(
        findValue(row, ["kategori", "category", "bolum", "section"]) ?? "",
      ).trim();
      const week = collected.get(id) ?? { id, title, topics: [] };
      if (week.title === `Hafta ${id}` && title !== week.title) week.title = title;
      week.topics.push({ category, question });
      collected.set(id, week);
    }
  }

  const weeks = [...collected.values()].sort((a, b) => a.id - b.id);
  if (weeks.length === 0) {
    throw new Error(
      "No topics found. Name each tab 'Hafta 1 - Topic' and use Kategori and Soru columns.",
    );
  }
  return weeks;
}

type WorkbookWeek = {
  id: number;
  title: string;
  topics: Array<{ category: string; question: string }>;
};

function sheetNameForWeek(week: WorkbookWeek): string {
  const safeTitle = week.title.replace(/[\\/*?:[\]]/g, " ").replace(/\s+/g, " ").trim();
  return `Hafta ${week.id} - ${safeTitle}`.slice(0, 31);
}

export function createWeeksWorkbook(weeks: WorkbookWeek[]): Buffer {
  if (weeks.length === 0) {
    throw new Error("There are no published weeks to export.");
  }
  const workbook = XLSX.utils.book_new();
  for (const week of [...weeks].sort((a, b) => a.id - b.id)) {
    const rows = week.topics.map((topic) => ({
      Başlık: week.title,
      Kategori: topic.category,
      Soru: topic.question,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows, {
      header: ["Başlık", "Kategori", "Soru"],
    });
    sheet["!cols"] = [{ wch: 28 }, { wch: 24 }, { wch: 78 }];
    XLSX.utils.book_append_sheet(workbook, sheet, sheetNameForWeek(week));
  }
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function createTemplateWorkbook(): Buffer {
  return createWeeksWorkbook([
    {
      id: 1,
      title: "Friendship",
      topics: [
        {
          category: "Warm-up",
          question: "What makes someone a good friend?",
        },
        {
          category: "Discussion",
          question: "How do friendships change as we grow older?",
        },
      ],
    },
    {
      id: 2,
      title: "Travel",
      topics: [
        {
          category: "Warm-up",
          question: "Where would you most like to travel?",
        },
      ],
    },
  ]);
}
