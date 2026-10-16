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

async function columnExists(tableName, columnName) {
  const [[row]] = await connection.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, columnName],
  );
  return Number(row.count) > 0;
}

async function columnDataType(tableName, columnName) {
  const [[row]] = await connection.execute(
    `SELECT data_type
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [tableName, columnName],
  );
  return row?.data_type ?? null;
}

try {
  const schema = fs.readFileSync(
    path.join(process.cwd(), "scripts", "mysql-schema.sql"),
    "utf8",
  );
  await connection.query(schema);
  if (!(await columnExists("news", "content_type"))) {
    await connection.query(
      "ALTER TABLE news ADD COLUMN content_type ENUM('update', 'news', 'video', 'blog') NOT NULL DEFAULT 'news' AFTER id",
    );
  }
  if (!(await columnExists("news", "category"))) {
    await connection.query(
      "ALTER TABLE news ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT '' AFTER abstract_en",
    );
  }
  if (!(await columnExists("news", "is_featured"))) {
    await connection.query(
      "ALTER TABLE news ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER is_published",
    );
  }
  if ((await columnDataType("news", "published_on")) === "date") {
    await connection.query("ALTER TABLE news MODIFY published_on DATETIME NULL");
  }

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
      !Array.isArray(seed.news) ||
      !Array.isArray(seed.settings) ||
      !Array.isArray(seed.weeks)
    ) {
      throw new Error("data/godaddy-seed.json has an unsupported format.");
    }

    await connection.beginTransaction();
    try {
      for (const page of seed.pages) {
        await connection.execute(
          `INSERT INTO pages (slug, title, eyebrow, summary, body, sections)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            page.slug,
            page.title,
            page.eyebrow,
            page.summary,
            page.body,
            JSON.stringify(page.sections ?? {}),
          ],
        );
      }
      for (const setting of seed.settings) {
        await connection.execute(
          "INSERT INTO settings (`key`, value) VALUES (?, ?)",
          [setting.key, setting.value],
        );
      }
      for (const item of seed.news) {
        await connection.execute(
          `INSERT INTO news (
            content_type, title_tr, title_en, abstract_tr, abstract_en, category,
            source_name, article_url, image_url, video_url, published_on,
            is_published, is_featured
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.content_type ?? "news",
            item.title_tr,
            item.title_en,
            item.abstract_tr,
            item.abstract_en,
            item.category ?? "",
            item.source_name,
            item.article_url,
            item.image_url,
            item.video_url,
            item.published_on,
            item.is_published,
            item.is_featured ?? 0,
          ],
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
