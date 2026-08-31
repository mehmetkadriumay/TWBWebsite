import "server-only";

import fs from "node:fs";
import path from "node:path";
import mysql, {
  type Pool,
  type PoolConnection,
  type PoolOptions,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import {
  defaultPages,
  legacyHowItWorksBodies,
  seedTopics,
} from "@/lib/default-content";
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

const globalForDb = globalThis as unknown as {
  twbMysqlPool?: Pool;
  twbMysqlInit?: Promise<void>;
};

function mysqlOptions(): PoolOptions {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const url = new URL(databaseUrl);
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
  ] as const;
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing MySQL configuration: ${missing.join(", ")}. Set DATABASE_URL or the MYSQL_* variables.`,
    );
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

function getPool(): Pool {
  if (!globalForDb.twbMysqlPool) {
    globalForDb.twbMysqlPool = mysql.createPool({
      ...mysqlOptions(),
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      multipleStatements: true,
      timezone: "Z",
    });
  }
  return globalForDb.twbMysqlPool;
}

async function initializeDatabase(pool: Pool): Promise<void> {
  const schemaPath = path.join(process.cwd(), "scripts", "mysql-schema.sql");
  await pool.query(fs.readFileSync(schemaPath, "utf8"));

  for (const page of defaultPages) {
    await pool.execute(
      `INSERT IGNORE INTO pages (slug, title, eyebrow, summary, body)
       VALUES (?, ?, ?, ?, ?)`,
      [page.slug, page.title, page.eyebrow, page.summary, page.body],
    );
  }

  const howItWorksTr = defaultPages.find(
    (page) => page.slug === "nasil-calisiyoruz",
  );
  const howItWorksEn = defaultPages.find(
    (page) => page.slug === "nasil-calisiyoruz-en",
  );
  if (howItWorksTr) {
    await pool.execute(
      `UPDATE pages SET body = ?, updated_at = CURRENT_TIMESTAMP
       WHERE slug = ? AND body = ?`,
      [howItWorksTr.body, howItWorksTr.slug, legacyHowItWorksBodies.tr],
    );
  }
  if (howItWorksEn) {
    await pool.execute(
      `UPDATE pages SET body = ?, updated_at = CURRENT_TIMESTAMP
       WHERE slug = ? AND body = ?`,
      [howItWorksEn.body, howItWorksEn.slug, legacyHowItWorksBodies.en],
    );
  }

  const settings: Array<[keyof AcademicCalendar, string]> = [
    ["semester1Start", "2026-09-07"],
    ["semester1End", "2026-12-14"],
    ["semester2Start", "2027-01-25"],
    ["semester2End", "2027-04-12"],
  ];
  for (const [key, value] of settings) {
    await pool.execute(
      "INSERT IGNORE INTO settings (`key`, value) VALUES (?, ?)",
      [key, value],
    );
  }

  const [countRows] = await pool.query<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM weeks",
  );
  if (Number(countRows[0]?.count ?? 0) > 0) return;

  const seedWorkbook = path.join(
    process.cwd(),
    "tum-haftalar-konusma-konulari.xlsx",
  );
  const seededWeeks = fs.existsSync(seedWorkbook)
    ? parseWeeksWorkbook(fs.readFileSync(seedWorkbook))
    : [
        {
          id: 1,
          title: "Hafta 1",
          topics: seedTopics.map((question) => ({
            title: "Camping",
            question,
          })),
        },
      ];
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await replaceWeeksWithConnection(connection, seededWeeks);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getDb(): Promise<Pool> {
  const pool = getPool();
  if (!globalForDb.twbMysqlInit) {
    globalForDb.twbMysqlInit = initializeDatabase(pool).catch((error) => {
      globalForDb.twbMysqlInit = undefined;
      throw error;
    });
  }
  await globalForDb.twbMysqlInit;
  return pool;
}

type PageRow = RowDataPacket & ContentPage;
type WeekRow = RowDataPacket & {
  id: number;
  title: string;
  imported_at: Date | string;
};
type TopicRow = RowDataPacket & {
  id: number;
  week_id: number;
  position: number;
  title: string;
  question: string;
};

export async function getPage(slug: string): Promise<ContentPage | null> {
  const db = await getDb();
  const [rows] = await db.execute<PageRow[]>(
    "SELECT slug, title, eyebrow, summary, body FROM pages WHERE slug = ?",
    [slug],
  );
  return rows[0] ?? null;
}

export async function getPages(): Promise<ContentPage[]> {
  const db = await getDb();
  const [rows] = await db.query<PageRow[]>(`
    SELECT slug, title, eyebrow, summary, body FROM pages
    ORDER BY FIELD(
      slug, 'home', 'bizim-hikayemiz', 'nasil-calisiyoruz',
      'projeye-katilim', 'home-en', 'bizim-hikayemiz-en',
      'nasil-calisiyoruz-en', 'projeye-katilim-en'
    ), slug
  `);
  return rows.map(({ slug, title, eyebrow, summary, body }) => ({
    slug,
    title,
    eyebrow,
    summary,
    body,
  }));
}

export async function updatePage(page: ContentPage): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE pages
     SET title = ?, eyebrow = ?, summary = ?, body = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE slug = ?`,
    [page.title, page.eyebrow, page.summary, page.body, page.slug],
  );
}

export async function createParticipationApplication(
  formType: "turkiye" | "us",
  locale: "tr" | "en",
  fields: Record<string, string>,
): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO participation_applications (form_type, locale, payload)
     VALUES (?, ?, ?)`,
    [formType, locale, JSON.stringify(fields)],
  );
}

export async function getWeeks(): Promise<Week[]> {
  const db = await getDb();
  const [weeks] = await db.query<WeekRow[]>(
    "SELECT id, title, imported_at FROM weeks ORDER BY id ASC",
  );
  const [topics] = await db.query<TopicRow[]>(`
    SELECT id, week_id, position, category AS title, question
    FROM topics ORDER BY week_id, position, id
  `);
  const topicsByWeek = new Map<number, TopicRow[]>();
  for (const topic of topics) {
    const collection = topicsByWeek.get(topic.week_id) ?? [];
    collection.push(topic);
    topicsByWeek.set(topic.week_id, collection);
  }
  return weeks.map((week) => ({
    id: week.id,
    title: week.title,
    importedAt:
      week.imported_at instanceof Date
        ? week.imported_at.toISOString()
        : String(week.imported_at),
    topics: (topicsByWeek.get(week.id) ?? []).map((topic) => ({
      id: topic.id,
      position: topic.position,
      title: topic.title,
      question: topic.question,
    })),
  }));
}

export type ImportedWeek = {
  id: number;
  title: string;
  topics: Array<{ title: string; question: string }>;
};

async function replaceWeeksWithConnection(
  db: Pool | PoolConnection,
  weeks: ImportedWeek[],
): Promise<void> {
  for (const week of weeks) {
    await db.execute(
      `INSERT INTO weeks (id, title, imported_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title), imported_at = CURRENT_TIMESTAMP`,
      [week.id, week.title],
    );
    await db.execute("DELETE FROM topics WHERE week_id = ?", [week.id]);
    for (const [index, topic] of week.topics.entries()) {
      await db.execute(
        `INSERT INTO topics (week_id, position, category, question)
         VALUES (?, ?, ?, ?)`,
        [week.id, index + 1, topic.title, topic.question],
      );
    }
  }
}

export async function replaceWeeks(weeks: ImportedWeek[]): Promise<void> {
  const db = await getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await replaceWeeksWithConnection(connection, weeks);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteWeek(id: number): Promise<boolean> {
  const db = await getDb();
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM weeks WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}

export async function getAcademicCalendar(): Promise<AcademicCalendar> {
  const db = await getDb();
  const [rows] = await db.query<
    (RowDataPacket & { key: keyof AcademicCalendar; value: string })[]
  >(
    `SELECT \`key\`, value FROM settings
     WHERE \`key\` IN (
       'semester1Start', 'semester1End', 'semester2Start', 'semester2End'
     )`,
  );
  return Object.fromEntries(
    rows.map((row) => [row.key, row.value]),
  ) as AcademicCalendar;
}

export async function updateAcademicCalendar(
  calendar: AcademicCalendar,
): Promise<void> {
  const db = await getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const [key, value] of Object.entries(calendar)) {
      await connection.execute(
        `INSERT INTO settings (\`key\`, value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value)`,
        [key, value],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

type SchoolRow = RowDataPacket & {
  id: number;
  school_name: string;
  coordinator_name: string;
  responsible_teacher_name: string;
  coordinator_whatsapp_group_name: string;
  student_whatsapp_group_name: string;
  meeting_link: string;
};

type AssignmentRow = RowDataPacket & {
  school_id: number;
  student_id: number;
  group_type: "foreign" | "turkish";
};

function mapSchool(row: SchoolRow, assignments: AssignmentRow[]): School {
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

export async function getSchools(): Promise<School[]> {
  const db = await getDb();
  const [rows] = await db.query<SchoolRow[]>(`
    SELECT id, school_name, coordinator_name, responsible_teacher_name,
      coordinator_whatsapp_group_name, student_whatsapp_group_name, meeting_link
    FROM schools ORDER BY school_name, id
  `);
  const [assignments] = await db.query<AssignmentRow[]>(
    `SELECT school_id, student_id, group_type
     FROM school_students ORDER BY school_id, student_id`,
  );
  const assignmentsBySchool = new Map<number, AssignmentRow[]>();
  for (const assignment of assignments) {
    const collection = assignmentsBySchool.get(assignment.school_id) ?? [];
    collection.push(assignment);
    assignmentsBySchool.set(assignment.school_id, collection);
  }
  return rows.map((row) =>
    mapSchool(row, assignmentsBySchool.get(row.id) ?? []),
  );
}

async function replaceSchoolStudents(
  db: PoolConnection,
  schoolId: number,
  school: SchoolInput,
): Promise<void> {
  await db.execute("DELETE FROM school_students WHERE school_id = ?", [
    schoolId,
  ]);
  const insertSql = `
    INSERT INTO school_students (school_id, student_id, group_type)
    SELECT ?, id, ? FROM students WHERE id = ? AND role = ?
  `;
  for (const studentId of school.foreignStudentIds) {
    const [result] = await db.execute<ResultSetHeader>(insertSql, [
      schoolId,
      "foreign",
      studentId,
      "facilitator",
    ]);
    if (result.affectedRows !== 1) {
      throw new Error(
        "Yabancı öğrenci seçimi yalnızca yabancı öğrenci rolünden yapılabilir.",
      );
    }
  }
  for (const studentId of school.turkishStudentIds) {
    const [result] = await db.execute<ResultSetHeader>(insertSql, [
      schoolId,
      "turkish",
      studentId,
      "student",
    ]);
    if (result.affectedRows !== 1) {
      throw new Error(
        "Türk öğrenci seçimi yalnızca öğrenci rolünden yapılabilir.",
      );
    }
  }
}

export async function createSchool(school: SchoolInput): Promise<School> {
  const db = await getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO schools (
        school_name, coordinator_name, responsible_teacher_name,
        coordinator_whatsapp_group_name, student_whatsapp_group_name,
        meeting_link
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        school.schoolName,
        school.coordinatorName,
        school.responsibleTeacherName,
        school.coordinatorWhatsappGroupName,
        school.studentWhatsappGroupName,
        school.meetingLink,
      ],
    );
    await replaceSchoolStudents(connection, result.insertId, school);
    await connection.commit();
    return { id: result.insertId, ...school };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateSchool(
  id: number,
  school: SchoolInput,
): Promise<School | null> {
  const db = await getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE schools SET
        school_name = ?, coordinator_name = ?, responsible_teacher_name = ?,
        coordinator_whatsapp_group_name = ?, student_whatsapp_group_name = ?,
        meeting_link = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        school.schoolName,
        school.coordinatorName,
        school.responsibleTeacherName,
        school.coordinatorWhatsappGroupName,
        school.studentWhatsappGroupName,
        school.meetingLink,
        id,
      ],
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return null;
    }
    await replaceSchoolStudents(connection, id, school);
    await connection.commit();
    return { id, ...school };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteSchool(id: number): Promise<boolean> {
  const db = await getDb();
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM schools WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}

type StudentRow = RowDataPacket & {
  id: number;
  student_name: string;
  school_or_coordinator_region: string;
  role: "facilitator" | "student";
  project_leader: number | boolean;
};

function mapStudent(row: StudentRow): Student {
  return {
    id: row.id,
    studentName: row.student_name,
    schoolOrCoordinatorRegion: row.school_or_coordinator_region,
    role: row.role,
    projectLeader: Boolean(row.project_leader),
  };
}

export async function getStudents(): Promise<Student[]> {
  const db = await getDb();
  const [rows] = await db.query<StudentRow[]>(`
    SELECT id, student_name, school_or_coordinator_region, role, project_leader
    FROM students ORDER BY student_name, id
  `);
  return rows.map(mapStudent);
}

export async function createStudent(
  student: StudentInput,
): Promise<Student> {
  const db = await getDb();
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO students (
      student_name, school_or_coordinator_region, role, project_leader
    ) VALUES (?, ?, ?, ?)`,
    [
      student.studentName,
      student.schoolOrCoordinatorRegion,
      student.role,
      student.projectLeader ? 1 : 0,
    ],
  );
  return { id: result.insertId, ...student };
}

export async function updateStudent(
  id: number,
  student: StudentInput,
): Promise<Student | null> {
  const db = await getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE students SET
        student_name = ?, school_or_coordinator_region = ?, role = ?,
        project_leader = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        student.studentName,
        student.schoolOrCoordinatorRegion,
        student.role,
        student.projectLeader ? 1 : 0,
        id,
      ],
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return null;
    }
    const incompatibleGroup =
      student.role === "facilitator" ? "turkish" : "foreign";
    await connection.execute(
      `DELETE FROM school_students
       WHERE student_id = ? AND group_type = ?`,
      [id, incompatibleGroup],
    );
    await connection.commit();
    return { id, ...student };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteStudent(id: number): Promise<boolean> {
  const db = await getDb();
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM students WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}
