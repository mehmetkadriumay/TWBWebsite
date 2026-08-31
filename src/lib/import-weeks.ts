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

export function parseWeeksWorkbook(buffer: Buffer): ImportedWeek[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const collected = new Map<number, ImportedWeek>();

  for (const sheetName of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[sheetName],
      { defval: "" },
    );
    const usesLegacyCategoryColumn = rows.some((row) =>
      String(
        findValue(row, ["kategori", "category", "bolum", "section"]) ?? "",
      ).trim(),
    );
    let currentTopicTitle = "";

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

      const heading = String(
        findValue(row, [
          "baslik",
          "title",
          "konu basligi",
          "topic",
          "topic title",
          "konu",
        ]) ?? "",
      ).trim();
      const legacyCategory = String(
        findValue(row, ["kategori", "category", "bolum", "section"]) ?? "",
      ).trim();
      const rowTopicTitle = usesLegacyCategoryColumn
        ? legacyCategory || heading
        : heading || currentTopicTitle;
      if (!rowTopicTitle) {
        throw new Error(
          `${sheetName}: Every question must be beneath a Başlık value.`,
        );
      }
      currentTopicTitle = rowTopicTitle;

      const week = collected.get(id) ?? {
        id,
        title: `Hafta ${id}`,
        topics: [],
      };
      week.topics.push({ title: rowTopicTitle, question });
      collected.set(id, week);
    }
  }

  const weeks = [...collected.values()].sort((a, b) => a.id - b.id);
  if (weeks.length === 0) {
    throw new Error(
      "No topics found. Name each tab 'Hafta 1' and use Başlık and Soru columns.",
    );
  }
  return weeks;
}

type WorkbookWeek = {
  id: number;
  title: string;
  topics: Array<{ title: string; question: string }>;
};

function sheetNameForWeek(week: WorkbookWeek): string {
  return `Hafta ${week.id}`;
}

export function createWeeksWorkbook(weeks: WorkbookWeek[]): Buffer {
  if (weeks.length === 0) {
    throw new Error("There are no published weeks to export.");
  }
  const workbook = XLSX.utils.book_new();
  for (const week of [...weeks].sort((a, b) => a.id - b.id)) {
    let previousTitle = "";
    const rows = week.topics.map((topic) => {
      const title = topic.title === previousTitle ? "" : topic.title;
      previousTitle = topic.title;
      return {
        Başlık: title,
        Soru: topic.question,
      };
    });
    const sheet = XLSX.utils.json_to_sheet(rows, {
      header: ["Başlık", "Soru"],
    });
    sheet["!cols"] = [{ wch: 30 }, { wch: 90 }];
    XLSX.utils.book_append_sheet(workbook, sheet, sheetNameForWeek(week));
  }
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function createTemplateWorkbook(): Buffer {
  return createWeeksWorkbook([
    {
      id: 1,
      title: "Hafta 1",
      topics: [
        {
          title: "Friendship",
          question: "What makes someone a good friend?",
        },
        {
          title: "Friendship",
          question: "How do friendships change as we grow older?",
        },
        {
          title: "Trust",
          question: "How can a person earn another person's trust?",
        },
      ],
    },
    {
      id: 2,
      title: "Hafta 2",
      topics: [
        {
          title: "Travel",
          question: "Where would you most like to travel?",
        },
      ],
    },
  ]);
}
