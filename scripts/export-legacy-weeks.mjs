import * as XLSX from "xlsx";

const sourceUrl = "http://www.turkswithoutborders.net/ders-programi-save/";
const outputPath =
  process.argv[2] ?? "tum-haftalar-konusma-konulari.xlsx";

function text(html) {
  const entities = {
    amp: "&",
    apos: "'",
    bull: "•",
    gt: ">",
    hellip: "…",
    ldquo: "“",
    lsquo: "‘",
    lt: "<",
    nbsp: " ",
    ndash: "–",
    quot: '"',
    rdquo: "”",
    rsquo: "’",
  };

  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, value) =>
      String.fromCodePoint(Number.parseInt(value, 16)),
    )
    .replace(/&#(\d+);/g, (_, value) =>
      String.fromCodePoint(Number.parseInt(value, 10)),
    )
    .replace(/&([a-z]+);/gi, (entity, name) => entities[name] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

function safeSheetName(id, title) {
  const safeTitle = title.replace(/[\\/*?:[\]]/g, " ").replace(/\s+/g, " ").trim();
  return `Hafta ${id} - ${safeTitle}`.slice(0, 31);
}

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Source returned HTTP ${response.status}.`);
}
const html = await response.text();
const headingPattern =
  /<h3[^>]*class="[^"]*elementor-heading-title[^"]*"[^>]*>\s*Hafta\s+(\d+)\s*<\/h3>/gi;
const headings = [...html.matchAll(headingPattern)];
const weeks = [];

for (let index = 0; index < headings.length; index += 1) {
  const id = Number.parseInt(headings[index][1], 10);
  const start = headings[index].index + headings[index][0].length;
  const end = headings[index + 1]?.index ?? html.length;
  const section = html.slice(start, end);
  const togglePattern =
    /<a[^>]*class="[^"]*elementor-toggle-title[^"]*"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<div[^>]*class="[^"]*elementor-tab-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  const topics = [];

  for (const toggle of section.matchAll(togglePattern)) {
    const category = text(toggle[1]);
    const content = toggle[2];
    const questionPattern = /<(?:li|p)[^>]*>([\s\S]*?)<\/(?:li|p)>/gi;
    for (const match of content.matchAll(questionPattern)) {
      const question = text(match[1]);
      if (question) topics.push({ category, question });
    }
  }

  if (topics.length === 0) {
    throw new Error(`No questions found for Hafta ${id}.`);
  }
  weeks.push({ id, title: topics[0].category || `Hafta ${id}`, topics });
}

if (weeks.length === 0) {
  throw new Error("No weekly headings were found in the source archive.");
}

const workbook = XLSX.utils.book_new();
for (const week of weeks) {
  const rows = week.topics.map((topic) => ({
    Başlık: week.title,
    Kategori: topic.category,
    Soru: topic.question,
  }));
  const sheet = XLSX.utils.json_to_sheet(rows, {
    header: ["Başlık", "Kategori", "Soru"],
  });
  sheet["!cols"] = [{ wch: 28 }, { wch: 24 }, { wch: 78 }];
  XLSX.utils.book_append_sheet(
    workbook,
    sheet,
    safeSheetName(week.id, week.title),
  );
}

XLSX.writeFile(workbook, outputPath);
const questionCount = weeks.reduce((total, week) => total + week.topics.length, 0);
console.log(`Exported ${weeks.length} weeks and ${questionCount} questions.`);
