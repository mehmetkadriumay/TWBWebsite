import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { loadLocalEnv, mysqlOptions } from "./db-config.mjs";

loadLocalEnv();

const connection = await mysql.createConnection({
  ...mysqlOptions(),
  timezone: "Z",
});

try {
  const [pages] = await connection.query(`
    SELECT slug, title, eyebrow, summary, body
    FROM pages ORDER BY slug
  `);
  const [settings] = await connection.query(`
    SELECT \`key\`, value FROM settings ORDER BY \`key\`
  `);
  const [weekRows] = await connection.query(`
    SELECT id, title FROM weeks ORDER BY id
  `);
  const [topicRows] = await connection.query(`
    SELECT week_id, category AS title, question
    FROM topics ORDER BY week_id, position, id
  `);
  const topicsByWeek = new Map();
  for (const topic of topicRows) {
    const topics = topicsByWeek.get(topic.week_id) ?? [];
    topics.push({ title: topic.title, question: topic.question });
    topicsByWeek.set(topic.week_id, topics);
  }

  const seed = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    description:
      "Public website content, weekly program, and scheduling configuration. Credentials, applications, and student records are intentionally excluded.",
    pages: pages.map(({ slug, title, eyebrow, summary, body }) => ({
      slug,
      title,
      eyebrow,
      summary,
      body,
    })),
    settings: settings.map(({ key, value }) => ({ key, value })),
    weeks: weekRows.map(({ id, title }) => ({
      id,
      title,
      topics: topicsByWeek.get(id) ?? [],
    })),
  };
  const outputPath = path.join(process.cwd(), "data", "godaddy-seed.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(seed, null, 2)}\n`);
  console.log(
    `Exported ${seed.pages.length} pages, ${seed.weeks.length} weeks, and ${topicRows.length} questions to data/godaddy-seed.json.`,
  );
} finally {
  await connection.end();
}
