import "server-only";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { defaultPages, seedTopics } from "@/lib/default-content";
import { parseWeeksWorkbook } from "@/lib/import-weeks";
import type {
  AcademicCalendar,
  ContentPage,
  School,
  SchoolInput,
  Student,
  StudentInput,
  Week,
} from "@/lib/types";

const databasePath =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "twb.sqlite");

const globalForDb = globalThis as unknown as { twbDb?: DatabaseSync };

function getDb(): DatabaseSync {
  if (globalForDb.twbDb) return globalForDb.twbDb;

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      eyebrow TEXT NOT NULL,
      summary TEXT NOT NULL,
      body TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weeks (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_id INTEGER NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      question TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_name TEXT NOT NULL,
      coordinator_name TEXT NOT NULL DEFAULT '',
      responsible_teacher_name TEXT NOT NULL DEFAULT '',
      foreign_students TEXT NOT NULL DEFAULT '',
      turkish_students TEXT NOT NULL DEFAULT '',
      coordinator_whatsapp_group_name TEXT NOT NULL DEFAULT '',
      student_whatsapp_group_name TEXT NOT NULL DEFAULT '',
      meeting_link TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      school_or_coordinator_region TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('facilitator', 'student')),
      project_leader INTEGER NOT NULL DEFAULT 0 CHECK (project_leader IN (0, 1)),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS school_students (
      school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      group_type TEXT NOT NULL CHECK (group_type IN ('foreign', 'turkish')),
      PRIMARY KEY (school_id, student_id, group_type)
    );
  `);

  const insertPage = db.prepare(`
    INSERT OR IGNORE INTO pages (slug, title, eyebrow, summary, body)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const page of defaultPages) {
    insertPage.run(page.slug, page.title, page.eyebrow, page.summary, page.body);
  }

  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  );
  insertSetting.run("semester1Start", "2026-09-07");
  insertSetting.run("semester1End", "2026-12-14");
  insertSetting.run("semester2Start", "2027-01-25");
  insertSetting.run("semester2End", "2027-04-12");

  if (
    (db.prepare("SELECT COUNT(*) AS count FROM weeks").get() as {
      count: number;
    }).count === 0
  ) {
    const seedWorkbook = path.join(
      process.cwd(),
      "tum-haftalar-konusma-konulari.xlsx",
    );
    const seededWeeks = fs.existsSync(seedWorkbook)
      ? parseWeeksWorkbook(fs.readFileSync(seedWorkbook))
      : [
          {
            id: 1,
            title: "Camping",
            topics: seedTopics.map((question) => ({
              category: "Conversation",
              question,
            })),
          },
        ];
    const insertWeek = db.prepare(
      "INSERT INTO weeks (id, title) VALUES (?, ?)",
    );
    const insertTopic = db.prepare(
      "INSERT INTO topics (week_id, position, category, question) VALUES (?, ?, ?, ?)",
    );
    for (const week of seededWeeks) {
      insertWeek.run(week.id, week.title);
      week.topics.forEach((topic, index) =>
        insertTopic.run(
          week.id,
          index + 1,
          topic.category,
          topic.question,
        ),
      );
    }
  }

  globalForDb.twbDb = db;
  return db;
}

type PageRow = ContentPage;
type WeekRow = { id: number; title: string; imported_at: string };
type TopicRow = {
  id: number;
  week_id: number;
  position: number;
  category: string;
  question: string;
};

export function getPage(slug: string): ContentPage | null {
  const db = getDb();
  return (
    (db
      .prepare(
        "SELECT slug, title, eyebrow, summary, body FROM pages WHERE slug = ?",
      )
      .get(slug) as PageRow | undefined) ?? null
  );
}

export function getPages(): ContentPage[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT slug, title, eyebrow, summary, body FROM pages ORDER BY rowid",
    )
    .all() as ContentPage[];
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    eyebrow: row.eyebrow,
    summary: row.summary,
    body: row.body,
  }));
}

export function updatePage(page: ContentPage): void {
  const db = getDb();
  db.prepare(`
    UPDATE pages
    SET title = ?, eyebrow = ?, summary = ?, body = ?, updated_at = CURRENT_TIMESTAMP
    WHERE slug = ?
  `).run(page.title, page.eyebrow, page.summary, page.body, page.slug);
}

export function getWeeks(): Week[] {
  const db = getDb();
  const weeks = db
    .prepare("SELECT id, title, imported_at FROM weeks ORDER BY id ASC")
    .all() as WeekRow[];
  const topicQuery = db.prepare(`
    SELECT id, week_id, position, category, question
    FROM topics WHERE week_id = ? ORDER BY position, id
  `);

  return weeks.map((week) => ({
    id: week.id,
    title: week.title,
    importedAt: week.imported_at,
    topics: (topicQuery.all(week.id) as TopicRow[]).map((topic) => ({
      id: topic.id,
      position: topic.position,
      category: topic.category,
      question: topic.question,
    })),
  }));
}

export type ImportedWeek = {
  id: number;
  title: string;
  topics: Array<{ category: string; question: string }>;
};

export function replaceWeeks(weeks: ImportedWeek[]): void {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const upsertWeek = db.prepare(`
      INSERT INTO weeks (id, title, imported_at) VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET title = excluded.title, imported_at = CURRENT_TIMESTAMP
    `);
    const deleteTopics = db.prepare("DELETE FROM topics WHERE week_id = ?");
    const insertTopic = db.prepare(`
      INSERT INTO topics (week_id, position, category, question)
      VALUES (?, ?, ?, ?)
    `);

    for (const week of weeks) {
      upsertWeek.run(week.id, week.title);
      deleteTopics.run(week.id);
      week.topics.forEach((topic, index) =>
        insertTopic.run(week.id, index + 1, topic.category, topic.question),
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function deleteWeek(id: number): boolean {
  const db = getDb();
  return db.prepare("DELETE FROM weeks WHERE id = ?").run(id).changes > 0;
}

export function getAcademicCalendar(): AcademicCalendar {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT key, value FROM settings WHERE key IN (?, ?, ?, ?)",
    )
    .all(
      "semester1Start",
      "semester1End",
      "semester2Start",
      "semester2End",
    ) as Array<{ key: keyof AcademicCalendar; value: string }>;
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as AcademicCalendar;
}

export function updateAcademicCalendar(calendar: AcademicCalendar): void {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const update = db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    );
    for (const [key, value] of Object.entries(calendar)) {
      update.run(key, value);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

type SchoolRow = {
  id: number;
  school_name: string;
  coordinator_name: string;
  responsible_teacher_name: string;
  coordinator_whatsapp_group_name: string;
  student_whatsapp_group_name: string;
  meeting_link: string;
};

function mapSchool(
  row: SchoolRow,
  assignments: Array<{ student_id: number; group_type: "foreign" | "turkish" }>,
): School {
  return {
    id: row.id,
    schoolName: row.school_name,
    coordinatorName: row.coordinator_name,
    responsibleTeacherName: row.responsible_teacher_name,
    foreignStudentIds: assignments
      .filter((item) => item.group_type === "foreign")
      .map((item) => item.student_id),
    turkishStudentIds: assignments
      .filter((item) => item.group_type === "turkish")
      .map((item) => item.student_id),
    coordinatorWhatsappGroupName: row.coordinator_whatsapp_group_name,
    studentWhatsappGroupName: row.student_whatsapp_group_name,
    meetingLink: row.meeting_link,
  };
}

export function getSchools(): School[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT id, school_name, coordinator_name, responsible_teacher_name,
        coordinator_whatsapp_group_name,
        student_whatsapp_group_name, meeting_link
      FROM schools ORDER BY school_name COLLATE NOCASE, id
    `)
    .all() as SchoolRow[];
  const assignmentQuery = db.prepare(
    "SELECT student_id, group_type FROM school_students WHERE school_id = ? ORDER BY student_id",
  );
  return rows.map((row) =>
    mapSchool(
      row,
      assignmentQuery.all(row.id) as Array<{
        student_id: number;
        group_type: "foreign" | "turkish";
      }>,
    ),
  );
}

export function createSchool(school: SchoolInput): School {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db.prepare(`
      INSERT INTO schools (
        school_name, coordinator_name, responsible_teacher_name,
        coordinator_whatsapp_group_name, student_whatsapp_group_name, meeting_link
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      school.schoolName,
      school.coordinatorName,
      school.responsibleTeacherName,
      school.coordinatorWhatsappGroupName,
      school.studentWhatsappGroupName,
      school.meetingLink,
    );
    const id = Number(result.lastInsertRowid);
    replaceSchoolStudents(db, id, school);
    db.exec("COMMIT");
    return { id, ...school };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function updateSchool(id: number, school: SchoolInput): School | null {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db.prepare(`
      UPDATE schools SET
        school_name = ?, coordinator_name = ?, responsible_teacher_name = ?,
        coordinator_whatsapp_group_name = ?, student_whatsapp_group_name = ?,
        meeting_link = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      school.schoolName,
      school.coordinatorName,
      school.responsibleTeacherName,
      school.coordinatorWhatsappGroupName,
      school.studentWhatsappGroupName,
      school.meetingLink,
      id,
    );
    if (result.changes === 0) {
      db.exec("ROLLBACK");
      return null;
    }
    replaceSchoolStudents(db, id, school);
    db.exec("COMMIT");
    return { id, ...school };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function replaceSchoolStudents(
  db: DatabaseSync,
  schoolId: number,
  school: SchoolInput,
): void {
  db.prepare("DELETE FROM school_students WHERE school_id = ?").run(schoolId);
  const insert = db.prepare(
    `INSERT INTO school_students (school_id, student_id, group_type)
     SELECT ?, id, ? FROM students WHERE id = ? AND role = ?`,
  );
  for (const studentId of school.foreignStudentIds) {
    if (
      insert.run(schoolId, "foreign", studentId, "facilitator").changes !== 1
    ) {
      throw new Error("Yabancı öğrenci seçimi yalnızca kolaylaştırıcı rolünden yapılabilir.");
    }
  }
  for (const studentId of school.turkishStudentIds) {
    if (insert.run(schoolId, "turkish", studentId, "student").changes !== 1) {
      throw new Error("Türk öğrenci seçimi yalnızca öğrenci rolünden yapılabilir.");
    }
  }
}

export function deleteSchool(id: number): boolean {
  const db = getDb();
  return db.prepare("DELETE FROM schools WHERE id = ?").run(id).changes > 0;
}

type StudentRow = {
  id: number;
  student_name: string;
  school_or_coordinator_region: string;
  role: "facilitator" | "student";
  project_leader: number;
};

function mapStudent(row: StudentRow): Student {
  return {
    id: row.id,
    studentName: row.student_name,
    schoolOrCoordinatorRegion: row.school_or_coordinator_region,
    role: row.role,
    projectLeader: row.project_leader === 1,
  };
}

export function getStudents(): Student[] {
  const db = getDb();
  return (
    db
      .prepare(`
        SELECT id, student_name, school_or_coordinator_region, role, project_leader
        FROM students ORDER BY student_name COLLATE NOCASE, id
      `)
      .all() as StudentRow[]
  ).map(mapStudent);
}

export function createStudent(student: StudentInput): Student {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO students (
      student_name, school_or_coordinator_region, role, project_leader
    ) VALUES (?, ?, ?, ?)
  `).run(
    student.studentName,
    student.schoolOrCoordinatorRegion,
    student.role,
    student.projectLeader ? 1 : 0,
  );
  return { id: Number(result.lastInsertRowid), ...student };
}

export function updateStudent(id: number, student: StudentInput): Student | null {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db.prepare(`
      UPDATE students SET student_name = ?, school_or_coordinator_region = ?,
        role = ?, project_leader = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      student.studentName,
      student.schoolOrCoordinatorRegion,
      student.role,
      student.projectLeader ? 1 : 0,
      id,
    );
    if (result.changes === 0) {
      db.exec("ROLLBACK");
      return null;
    }
    const incompatibleGroup = student.role === "facilitator" ? "turkish" : "foreign";
    db.prepare(
      "DELETE FROM school_students WHERE student_id = ? AND group_type = ?",
    ).run(id, incompatibleGroup);
    db.exec("COMMIT");
    return { id, ...student };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function deleteStudent(id: number): boolean {
  const db = getDb();
  return db.prepare("DELETE FROM students WHERE id = ?").run(id).changes > 0;
}
