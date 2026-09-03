import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { loadLocalEnv, mysqlOptions } from "./db-config.mjs";

loadLocalEnv();

const connection = await mysql.createConnection({
  ...mysqlOptions(),
  multipleStatements: true,
  timezone: "Z",
});

try {
  const schema = fs.readFileSync(
    path.join(process.cwd(), "scripts", "mysql-schema.sql"),
    "utf8",
  );
  await connection.query(schema);

  const [[counts]] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM pages) AS page_count,
      (SELECT COUNT(*) FROM weeks) AS week_count
  `);
  if (Number(counts.page_count) > 0 || Number(counts.week_count) > 0) {
    console.log("Database schema is ready. Existing content was left unchanged.");
    process.exitCode = 0;
  } else {
    const seedPath = path.join(process.cwd(), "data", "godaddy-seed.json");
    if (!fs.existsSync(seedPath)) {
      throw new Error(
        "data/godaddy-seed.json is missing. Run npm run db:export:deployment first.",
      );
    }
    const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    if (
      seed.schemaVersion !== 1 ||
      !Array.isArray(seed.pages) ||
      !Array.isArray(seed.settings) ||
      !Array.isArray(seed.weeks)
    ) {
      throw new Error("data/godaddy-seed.json has an unsupported format.");
    }

    await connection.beginTransaction();
    try {
      for (const page of seed.pages) {
        await connection.execute(
          `INSERT INTO pages (slug, title, eyebrow, summary, body)
           VALUES (?, ?, ?, ?, ?)`,
          [page.slug, page.title, page.eyebrow, page.summary, page.body],
        );
      }
      for (const setting of seed.settings) {
        await connection.execute(
          "INSERT INTO settings (`key`, value) VALUES (?, ?)",
          [setting.key, setting.value],
        );
      }
      for (const week of seed.weeks) {
        await connection.execute(
          "INSERT INTO weeks (id, title) VALUES (?, ?)",
          [week.id, week.title],
        );
        for (const [position, topic] of week.topics.entries()) {
          await connection.execute(
            `INSERT INTO topics (week_id, position, category, question)
             VALUES (?, ?, ?, ?)`,
            [week.id, position + 1, topic.title, topic.question],
          );
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    const questionCount = seed.weeks.reduce(
      (total, week) => total + week.topics.length,
      0,
    );
    console.log(
      `Initialized database with ${seed.pages.length} pages, ${seed.weeks.length} weeks, and ${questionCount} questions.`,
    );
  }
} finally {
  await connection.end();
}
