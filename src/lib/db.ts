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
  currentParticipationBodies,
  legacyHowItWorksBodies,
  legacyParticipationBodies,
  seedTopics,
} from "@/lib/default-content";
import { parseWeeksWorkbook } from "@/lib/import-weeks";
import type {
  AcademicCalendar,
  ContentPage,
  ParticipationApplication,
  School,
  SchoolInput,
  Student,
  StudentInput,
  StudentType,
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
  await migrateStudentSchema(pool);

  for (const page of defaultPages) {
    await pool.execute(
      `INSERT IGNORE INTO pages (slug, title, eyebrow, summary, body)
       VALUES (?, ?, ?, ?, ?)`,
      [page.slug, page.title, page.eyebrow, page.summary, page.body],
    );
  }

  async function tableExists(pool: Pool, tableName: string): Promise<boolean> {
    const [rows] = await pool.execute<(RowDataPacket & { count: number })[]>(
      `SELECT COUNT(*) AS count
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName],
    );
    return Number(rows[0]?.count ?? 0) > 0;
  }

  async function columnExists(
    pool: Pool,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const [rows] = await pool.execute<(RowDataPacket & { count: number })[]>(
      `SELECT COUNT(*) AS count
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
      [tableName, columnName],
    );
    return Number(rows[0]?.count ?? 0) > 0;
  }

  async function migrateStudentSchema(pool: Pool): Promise<void> {
    const applicationColumns = [
      ["status", "ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'"],
      ["reviewed_at", "TIMESTAMP NULL"],
      ["student_id", "INT NULL"],
      ["student_type", "ENUM('foreign', 'turkish') NULL"],
    ] as const;
    for (const [name, definition] of applicationColumns) {
      if (!(await columnExists(pool, "participation_applications", name))) {
        await pool.query(
          `ALTER TABLE participation_applications ADD COLUMN ${name} ${definition}`,
        );
      }
    }

    if (!(await tableExists(pool, "students"))) return;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(`
        INSERT IGNORE INTO foreign_students (
          id, applicant_first_name, applicant_last_name, applicant_email,
          state, details, project_leader, updated_at
        )
        SELECT id, student_name, '', '', school_or_coordinator_region, '',
          project_leader, updated_at
        FROM students WHERE role = 'facilitator'
      `);
      await connection.query(`
        INSERT IGNORE INTO turkish_students (
          id, teacher_first_name, teacher_last_name, teacher_email,
          school_name, details, project_leader, updated_at
        )
        SELECT id, student_name, '', '', school_or_coordinator_region, '',
          project_leader, updated_at
        FROM students WHERE role = 'student'
      `);
      if (await tableExists(pool, "school_students")) {
        await connection.query(`
          INSERT IGNORE INTO school_foreign_students (school_id, student_id)
          SELECT school_id, student_id FROM school_students
          WHERE group_type = 'foreign'
        `);
        await connection.query(`
          INSERT IGNORE INTO school_turkish_students (school_id, student_id)
          SELECT school_id, student_id FROM school_students
          WHERE group_type = 'turkish'
        `);
        await connection.query("DROP TABLE school_students");
      }
      await connection.query("DROP TABLE students");
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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

  await pool.execute(
    `UPDATE pages SET body = ?, updated_at = CURRENT_TIMESTAMP
     WHERE slug = 'projeye-katilim' AND body = ?`,
    [currentParticipationBodies.tr, legacyParticipationBodies.tr],
  );
  await pool.execute(
    `UPDATE pages SET body = ?, updated_at = CURRENT_TIMESTAMP
     WHERE slug = 'projeye-katilim-en' AND body = ?`,
    [currentParticipationBodies.en, legacyParticipationBodies.en],
  );

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

export async function updateWeekTopics(
  id: number,
  topics: Array<{ title: string; question: string }>,
): Promise<boolean> {
  const db = await getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [weekRows] = await connection.execute<(RowDataPacket & { id: number })[]>(
      "SELECT id FROM weeks WHERE id = ? FOR UPDATE",
      [id],
    );
    if (!weekRows[0]) {
      await connection.rollback();
      return false;
    }
    await connection.execute("DELETE FROM topics WHERE week_id = ?", [id]);
    for (const [position, topic] of topics.entries()) {
      await connection.execute(
        `INSERT INTO topics (week_id, position, category, question)
         VALUES (?, ?, ?, ?)`,
        [id, position + 1, topic.title, topic.question],
      );
    }
    await connection.execute(
      "UPDATE weeks SET imported_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id],
    );
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
  student_type: StudentType;
};

function mapSchool(row: SchoolRow, assignments: AssignmentRow[]): School {
  return {
    id: row.id,
    schoolName: row.school_name,
    coordinatorName: row.coordinator_name,
    responsibleTeacherName: row.responsible_teacher_name,
    foreignStudentIds: assignments
      .filter((item) => item.student_type === "foreign")
      .map((item) => item.student_id),
    turkishStudentIds: assignments
      .filter((item) => item.student_type === "turkish")
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
    `SELECT school_id, student_id, 'foreign' AS student_type
     FROM school_foreign_students
     UNION ALL
     SELECT school_id, student_id, 'turkish' AS student_type
     FROM school_turkish_students
     ORDER BY school_id, student_id`,
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
  await db.execute("DELETE FROM school_foreign_students WHERE school_id = ?", [
    schoolId,
  ]);
  await db.execute("DELETE FROM school_turkish_students WHERE school_id = ?", [
    schoolId,
  ]);
  for (const studentId of school.foreignStudentIds) {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO school_foreign_students (school_id, student_id)
       SELECT ?, id FROM foreign_students WHERE id = ?`,
      [
      schoolId,
      studentId,
      ],
    );
    if (result.affectedRows !== 1) {
      throw new Error("Yabancı öğrenci bulunamadı.");
    }
  }
  for (const studentId of school.turkishStudentIds) {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO school_turkish_students (school_id, student_id)
       SELECT ?, id FROM turkish_students WHERE id = ?`,
      [schoolId, studentId],
    );
    if (result.affectedRows !== 1) {
      throw new Error("Türk öğrenci bulunamadı.");
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

type ForeignStudentRow = RowDataPacket & {
  id: number;
  application_id: number | null;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  date_of_birth: string;
  state: string;
  city: string;
  referrer_first_name: string;
  referrer_last_name: string;
  referrer_email: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  details: string;
  project_leader: number | boolean;
};

type TurkishStudentRow = RowDataPacket & {
  id: number;
  application_id: number | null;
  teacher_first_name: string;
  teacher_last_name: string;
  teacher_email: string;
  teacher_phone: string;
  school_name: string;
  province: string;
  district: string;
  principal_name: string;
  student_count: string;
  age_group: string;
  english_level: string;
  details: string;
  project_leader: number | boolean;
};

function mapForeignStudent(row: ForeignStudentRow): Student {
  return {
    id: row.id,
    applicationId: row.application_id,
    studentType: "foreign",
    studentName: `${row.applicant_first_name} ${row.applicant_last_name}`.trim(),
    schoolOrCoordinatorRegion: [row.city, row.state].filter(Boolean).join(", "),
    applicantFirstName: row.applicant_first_name,
    applicantLastName: row.applicant_last_name,
    applicantEmail: row.applicant_email,
    dateOfBirth: row.date_of_birth,
    state: row.state,
    city: row.city,
    referrerFirstName: row.referrer_first_name,
    referrerLastName: row.referrer_last_name,
    referrerEmail: row.referrer_email,
    parentFirstName: row.parent_first_name,
    parentLastName: row.parent_last_name,
    parentEmail: row.parent_email,
    parentPhone: row.parent_phone,
    details: row.details,
    projectLeader: Boolean(row.project_leader),
  };
}

function mapTurkishStudent(row: TurkishStudentRow): Student {
  return {
    id: row.id,
    applicationId: row.application_id,
    studentType: "turkish",
    studentName: `${row.teacher_first_name} ${row.teacher_last_name}`.trim(),
    schoolOrCoordinatorRegion: [row.school_name, row.province]
      .filter(Boolean)
      .join(", "),
    teacherFirstName: row.teacher_first_name,
    teacherLastName: row.teacher_last_name,
    teacherEmail: row.teacher_email,
    teacherPhone: row.teacher_phone,
    schoolName: row.school_name,
    province: row.province,
    district: row.district,
    principalName: row.principal_name,
    studentCount: row.student_count,
    ageGroup: row.age_group,
    englishLevel: row.english_level,
    details: row.details,
    projectLeader: Boolean(row.project_leader),
  };
}

export async function getStudents(): Promise<Student[]> {
  const db = await getDb();
  const [foreignRows] = await db.query<ForeignStudentRow[]>(`
    SELECT id, application_id, applicant_first_name, applicant_last_name,
      applicant_email, date_of_birth, state, city, referrer_first_name,
      referrer_last_name, referrer_email, parent_first_name, parent_last_name,
      parent_email, parent_phone, details, project_leader
    FROM foreign_students ORDER BY applicant_last_name, applicant_first_name, id
  `);
  const [turkishRows] = await db.query<TurkishStudentRow[]>(`
    SELECT id, application_id, teacher_first_name, teacher_last_name,
      teacher_email, teacher_phone, school_name, province, district,
      principal_name, student_count, age_group, english_level, details,
      project_leader
    FROM turkish_students ORDER BY school_name, teacher_last_name, id
  `);
  return [
    ...foreignRows.map(mapForeignStudent),
    ...turkishRows.map(mapTurkishStudent),
  ];
}

export async function createStudent(
  student: StudentInput,
): Promise<Student> {
  const db = await getDb();
  if (student.studentType === "foreign") {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO foreign_students (
        applicant_first_name, applicant_last_name, applicant_email,
        date_of_birth, state, city, referrer_first_name, referrer_last_name,
        referrer_email, parent_first_name, parent_last_name, parent_email,
        parent_phone, details, project_leader
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student.applicantFirstName,
        student.applicantLastName,
        student.applicantEmail,
        student.dateOfBirth,
        student.state,
        student.city,
        student.referrerFirstName,
        student.referrerLastName,
        student.referrerEmail,
        student.parentFirstName,
        student.parentLastName,
        student.parentEmail,
        student.parentPhone,
        student.details,
        student.projectLeader ? 1 : 0,
      ],
    );
    return {
      id: result.insertId,
      applicationId: null,
      studentName: `${student.applicantFirstName} ${student.applicantLastName}`.trim(),
      schoolOrCoordinatorRegion: [student.city, student.state].filter(Boolean).join(", "),
      ...student,
    };
  }
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO turkish_students (
      teacher_first_name, teacher_last_name, teacher_email, teacher_phone,
      school_name, province, district, principal_name, student_count,
      age_group, english_level, details, project_leader
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      student.teacherFirstName,
      student.teacherLastName,
      student.teacherEmail,
      student.teacherPhone,
      student.schoolName,
      student.province,
      student.district,
      student.principalName,
      student.studentCount,
      student.ageGroup,
      student.englishLevel,
      student.details,
      student.projectLeader ? 1 : 0,
    ],
  );
  return {
    id: result.insertId,
    applicationId: null,
    studentName: `${student.teacherFirstName} ${student.teacherLastName}`.trim(),
    schoolOrCoordinatorRegion: [student.schoolName, student.province].filter(Boolean).join(", "),
    ...student,
  };
}

export async function updateStudent(
  id: number,
  student: StudentInput,
): Promise<Student | null> {
  const db = await getDb();
  if (student.studentType === "foreign") {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE foreign_students SET
        applicant_first_name = ?, applicant_last_name = ?, applicant_email = ?,
        date_of_birth = ?, state = ?, city = ?, referrer_first_name = ?,
        referrer_last_name = ?, referrer_email = ?, parent_first_name = ?,
        parent_last_name = ?, parent_email = ?, parent_phone = ?, details = ?,
        project_leader = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        student.applicantFirstName,
        student.applicantLastName,
        student.applicantEmail,
        student.dateOfBirth,
        student.state,
        student.city,
        student.referrerFirstName,
        student.referrerLastName,
        student.referrerEmail,
        student.parentFirstName,
        student.parentLastName,
        student.parentEmail,
        student.parentPhone,
        student.details,
        student.projectLeader ? 1 : 0,
        id,
      ],
    );
    if (result.affectedRows === 0) return null;
    const [rows] = await db.execute<ForeignStudentRow[]>(
      `SELECT id, application_id, applicant_first_name, applicant_last_name,
        applicant_email, date_of_birth, state, city, referrer_first_name,
        referrer_last_name, referrer_email, parent_first_name, parent_last_name,
        parent_email, parent_phone, details, project_leader
       FROM foreign_students WHERE id = ?`,
      [id],
    );
    return mapForeignStudent(rows[0]);
  }
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE turkish_students SET
      teacher_first_name = ?, teacher_last_name = ?, teacher_email = ?,
      teacher_phone = ?, school_name = ?, province = ?, district = ?,
      principal_name = ?, student_count = ?, age_group = ?, english_level = ?,
      details = ?, project_leader = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      student.teacherFirstName,
      student.teacherLastName,
      student.teacherEmail,
      student.teacherPhone,
      student.schoolName,
      student.province,
      student.district,
      student.principalName,
      student.studentCount,
      student.ageGroup,
      student.englishLevel,
      student.details,
      student.projectLeader ? 1 : 0,
      id,
    ],
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await db.execute<TurkishStudentRow[]>(
    `SELECT id, application_id, teacher_first_name, teacher_last_name,
      teacher_email, teacher_phone, school_name, province, district,
      principal_name, student_count, age_group, english_level, details,
      project_leader
     FROM turkish_students WHERE id = ?`,
    [id],
  );
  return mapTurkishStudent(rows[0]);
}

export async function deleteStudent(
  type: StudentType,
  id: number,
): Promise<boolean> {
  const db = await getDb();
  const [result] = await db.execute<ResultSetHeader>(
    `DELETE FROM ${type === "foreign" ? "foreign_students" : "turkish_students"}
     WHERE id = ?`,
    [id],
  );
  return result.affectedRows > 0;
}

type ApplicationRow = RowDataPacket & {
  id: number;
  form_type: "turkiye" | "us";
  locale: "tr" | "en";
  payload: Record<string, string> | string;
  status: "pending" | "approved" | "rejected";
  submitted_at: Date | string;
  reviewed_at: Date | string | null;
  student_id: number | null;
  student_type: StudentType | null;
};

function mapApplication(row: ApplicationRow): ParticipationApplication {
  return {
    id: row.id,
    formType: row.form_type,
    locale: row.locale,
    fields:
      typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload,
    status: row.status,
    submittedAt: new Date(row.submitted_at).toISOString(),
    reviewedAt: row.reviewed_at
      ? new Date(row.reviewed_at).toISOString()
      : null,
    studentId: row.student_id,
    studentType: row.student_type,
  };
}

export async function getParticipationApplications(): Promise<
  ParticipationApplication[]
> {
  const db = await getDb();
  const [rows] = await db.query<ApplicationRow[]>(`
    SELECT id, form_type, locale, payload, status, submitted_at, reviewed_at,
      student_id, student_type
    FROM participation_applications
    ORDER BY FIELD(status, 'pending', 'approved', 'rejected'), submitted_at DESC
  `);
  return rows.map(mapApplication);
}

export async function reviewParticipationApplication(
  id: number,
  decision: "approve" | "reject",
): Promise<ParticipationApplication | null> {
  const db = await getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<ApplicationRow[]>(
      `SELECT id, form_type, locale, payload, status, submitted_at, reviewed_at,
        student_id, student_type
       FROM participation_applications WHERE id = ? FOR UPDATE`,
      [id],
    );
    const application = rows[0];
    if (!application) {
      await connection.rollback();
      return null;
    }
    if (application.status !== "pending") {
      throw new Error("Bu başvuru daha önce değerlendirilmiş.");
    }

    if (decision === "reject") {
      await connection.execute(
        `UPDATE participation_applications
         SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id],
      );
    } else {
      const fields =
        typeof application.payload === "string"
          ? JSON.parse(application.payload)
          : application.payload;
      const type: StudentType =
        application.form_type === "us" ? "foreign" : "turkish";
      let studentId: number;
      if (type === "foreign") {
        const [result] = await connection.execute<ResultSetHeader>(
          `INSERT INTO foreign_students (
            application_id, applicant_first_name, applicant_last_name,
            applicant_email, date_of_birth, state, city, referrer_first_name,
            referrer_last_name, referrer_email, parent_first_name,
            parent_last_name, parent_email, parent_phone, details
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            fields.applicantFirstName ?? "",
            fields.applicantLastName ?? "",
            fields.applicantEmail ?? "",
            fields.dateOfBirth ?? "",
            fields.state ?? "",
            fields.city ?? "",
            fields.referrerFirstName ?? "",
            fields.referrerLastName ?? "",
            fields.referrerEmail ?? "",
            fields.parentFirstName ?? "",
            fields.parentLastName ?? "",
            fields.parentEmail ?? "",
            fields.parentPhone ?? "",
            fields.details ?? "",
          ],
        );
        studentId = result.insertId;
      } else {
        const [result] = await connection.execute<ResultSetHeader>(
          `INSERT INTO turkish_students (
            application_id, teacher_first_name, teacher_last_name,
            teacher_email, teacher_phone, school_name, province, district,
            principal_name, student_count, age_group, english_level, details
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            fields.teacherFirstName ?? "",
            fields.teacherLastName ?? "",
            fields.teacherEmail ?? "",
            fields.teacherPhone ?? "",
            fields.schoolName ?? "",
            fields.province ?? "",
            fields.district ?? "",
            fields.principalName ?? "",
            fields.studentCount ?? "",
            fields.ageGroup ?? "",
            fields.englishLevel ?? "",
            fields.details ?? "",
          ],
        );
        studentId = result.insertId;
      }
      await connection.execute(
        `UPDATE participation_applications
         SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP,
           student_id = ?, student_type = ?
         WHERE id = ?`,
        [studentId, type, id],
      );
    }
    await connection.commit();
    const [updatedRows] = await db.execute<ApplicationRow[]>(
      `SELECT id, form_type, locale, payload, status, submitted_at, reviewed_at,
        student_id, student_type
       FROM participation_applications WHERE id = ?`,
      [id],
    );
    return mapApplication(updatedRows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteApprovedParticipationApplication(
  id: number,
): Promise<boolean> {
  const db = await getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<ApplicationRow[]>(
      `SELECT id, form_type, locale, payload, status, submitted_at, reviewed_at,
        student_id, student_type
       FROM participation_applications WHERE id = ? FOR UPDATE`,
      [id],
    );
    const application = rows[0];
    if (!application) {
      await connection.rollback();
      return false;
    }
    if (
      application.status !== "approved" ||
      !application.student_id ||
      !application.student_type
    ) {
      throw new Error("Yalnızca onaylanmış başvurular silinebilir.");
    }

    const studentTable =
      application.student_type === "foreign"
        ? "foreign_students"
        : "turkish_students";
    await connection.execute(
      `DELETE FROM ${studentTable} WHERE id = ? AND application_id = ?`,
      [application.student_id, id],
    );
    await connection.execute(
      "DELETE FROM participation_applications WHERE id = ?",
      [id],
    );
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
