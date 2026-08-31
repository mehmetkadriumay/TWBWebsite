import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import mysql from "mysql2/promise";

if (typeof process.loadEnvFile === "function" && fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

function mysqlOptions() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    if (url.protocol !== "mysql:") {
      throw new Error("DATABASE_URL must use the mysql:// protocol.");
    }
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
      ssl:
        url.searchParams.get("ssl") === "true" ||
        process.env.MYSQL_SSL === "true"
          ? {}
          : undefined,
    };
  }
  const required = [
    "MYSQL_HOST",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE",
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing MySQL configuration: ${missing.join(", ")}`);
  }
  return {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL === "true" ? {} : undefined,
  };
}

const sqlitePath =
  process.argv.find((argument) => argument.startsWith("--sqlite="))?.slice(9) ??
  path.join(process.cwd(), "data", "twb.sqlite");
const force = process.argv.includes("--force");
if (!fs.existsSync(sqlitePath)) {
  throw new Error(`SQLite source not found: ${sqlitePath}`);
}

const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });
const connection = await mysql.createConnection({
  ...mysqlOptions(),
  multipleStatements: true,
  timezone: "Z",
});

const read = (query) => sqlite.prepare(query).all();
const source = {
  pages: read("SELECT slug, title, eyebrow, summary, body, updated_at FROM pages"),
  weeks: read("SELECT id, title, imported_at FROM weeks"),
  topics: read(
    "SELECT id, week_id, position, category, question FROM topics ORDER BY id",
  ),
  settings: read("SELECT key, value FROM settings"),
  schools: read(`
    SELECT id, school_name, coordinator_name, responsible_teacher_name,
      coordinator_whatsapp_group_name, student_whatsapp_group_name,
      meeting_link, updated_at
    FROM schools
  `),
  students: read(`
    SELECT id, student_name, school_or_coordinator_region, role,
      project_leader, updated_at
    FROM students
  `),
  assignments: read(
    "SELECT school_id, student_id, group_type FROM school_students",
  ),
  applications: read(`
    SELECT id, form_type, locale, payload, submitted_at
    FROM participation_applications
  `),
};

try {
  const schema = fs.readFileSync(
    path.join(process.cwd(), "scripts", "mysql-schema.sql"),
    "utf8",
  );
  await connection.query(schema);
  const [targetRows] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM pages) +
      (SELECT COUNT(*) FROM weeks) +
      (SELECT COUNT(*) FROM schools) +
      (SELECT COUNT(*) FROM students) +
      (SELECT COUNT(*) FROM participation_applications) AS row_count
  `);
  if (Number(targetRows[0].row_count) > 0 && !force) {
    throw new Error(
      "The MySQL database is not empty. Use --force only when you intend to replace its current TWB data.",
    );
  }

  await connection.beginTransaction();
  if (force) {
    await connection.query("DELETE FROM school_students");
    await connection.query("DELETE FROM topics");
    await connection.query("DELETE FROM participation_applications");
    await connection.query("DELETE FROM schools");
    await connection.query("DELETE FROM students");
    await connection.query("DELETE FROM weeks");
    await connection.query("DELETE FROM settings");
    await connection.query("DELETE FROM pages");
  }

  for (const row of source.pages) {
    await connection.execute(
      `INSERT INTO pages
        (slug, title, eyebrow, summary, body, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [row.slug, row.title, row.eyebrow, row.summary, row.body, row.updated_at],
    );
  }
  for (const row of source.weeks) {
    await connection.execute(
      "INSERT INTO weeks (id, title, imported_at) VALUES (?, ?, ?)",
      [row.id, row.title, row.imported_at],
    );
  }
  for (const row of source.topics) {
    await connection.execute(
      `INSERT INTO topics
        (id, week_id, position, category, question)
       VALUES (?, ?, ?, ?, ?)`,
      [row.id, row.week_id, row.position, row.category, row.question],
    );
  }
  for (const row of source.settings) {
    await connection.execute(
      "INSERT INTO settings (`key`, value) VALUES (?, ?)",
      [row.key, row.value],
    );
  }
  for (const row of source.schools) {
    await connection.execute(
      `INSERT INTO schools (
        id, school_name, coordinator_name, responsible_teacher_name,
        coordinator_whatsapp_group_name, student_whatsapp_group_name,
        meeting_link, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.school_name,
        row.coordinator_name,
        row.responsible_teacher_name,
        row.coordinator_whatsapp_group_name,
        row.student_whatsapp_group_name,
        row.meeting_link,
        row.updated_at,
      ],
    );
  }
  for (const row of source.students) {
    await connection.execute(
      `INSERT INTO students (
        id, student_name, school_or_coordinator_region, role,
        project_leader, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.student_name,
        row.school_or_coordinator_region,
        row.role,
        row.project_leader,
        row.updated_at,
      ],
    );
  }
  for (const row of source.assignments) {
    await connection.execute(
      `INSERT INTO school_students (school_id, student_id, group_type)
       VALUES (?, ?, ?)`,
      [row.school_id, row.student_id, row.group_type],
    );
  }
  for (const row of source.applications) {
    await connection.execute(
      `INSERT INTO participation_applications
        (id, form_type, locale, payload, submitted_at)
       VALUES (?, ?, ?, ?, ?)`,
      [row.id, row.form_type, row.locale, row.payload, row.submitted_at],
    );
  }
  await connection.commit();

  const counts = Object.fromEntries(
    Object.entries(source).map(([name, rows]) => [name, rows.length]),
  );
  console.log("SQLite data migrated to MySQL:", counts);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  sqlite.close();
  await connection.end();
}
