"use client";

import { useState } from "react";
import { ContentEditor } from "@/components/content-editor";
import { TimeManagement } from "@/components/time-management";
import { SchoolManagement } from "@/components/school-management";
import { StudentManagement } from "@/components/student-management";
import type { Locale } from "@/lib/i18n";
import type {
  AcademicCalendar,
  ContentPage,
  School,
  Student,
} from "@/lib/types";

export function AdminWorkspace({
  calendar,
  locale,
  pages,
  schools,
  students,
}: {
  calendar: AcademicCalendar;
  locale: Locale;
  pages: ContentPage[];
  schools: School[];
  students: Student[];
}) {
  const [tab, setTab] = useState<
    "content" | "time" | "schools" | "students"
  >("content");
  const [currentStudents, setCurrentStudents] = useState(students);

  return (
    <>
      <div className="admin-workspace-tabs">
        <button
          className={tab === "content" ? "active" : ""}
          onClick={() => setTab("content")}
          type="button"
        >
          {locale === "tr" ? "İçerik Yönetimi" : "Content Management"}
        </button>
        <button
          className={tab === "time" ? "active" : ""}
          onClick={() => setTab("time")}
          type="button"
        >
          {locale === "tr" ? "Zaman Yönetimi" : "Time Management"}
        </button>
        <button
          className={tab === "schools" ? "active" : ""}
          onClick={() => setTab("schools")}
          type="button"
        >
          {locale === "tr" ? "Okul Yönetimi" : "School Management"}
        </button>
        <button
          className={tab === "students" ? "active" : ""}
          onClick={() => setTab("students")}
          type="button"
        >
          {locale === "tr" ? "Öğrenci Yönetimi" : "Student Management"}
        </button>
      </div>
      {tab === "content" ? (
        <ContentEditor locale={locale} pages={pages} />
      ) : tab === "time" ? (
        <TimeManagement calendar={calendar} locale={locale} />
      ) : tab === "schools" ? (
        <SchoolManagement
          initialSchools={schools}
          locale={locale}
          students={currentStudents}
        />
      ) : (
        <StudentManagement
          initialStudents={currentStudents}
          locale={locale}
          onStudentsChange={setCurrentStudents}
        />
      )}
    </>
  );
}
