"use client";

import { FormEvent, useState } from "react";
import { TrashIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import type { Student, StudentInput } from "@/lib/types";

const emptyStudent: StudentInput = {
  studentName: "",
  schoolOrCoordinatorRegion: "",
  role: "student",
  projectLeader: false,
};

export function StudentManagement({
  initialStudents,
  locale,
  onStudentsChange,
}: {
  initialStudents: Student[];
  locale: Locale;
  onStudentsChange: (students: Student[]) => void;
}) {
  const [students, setStudents] = useState(initialStudents);
  const [selectedId, setSelectedId] = useState<number | "new" | "grid">("grid");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected =
    selectedId === "new" || selectedId === "grid"
      ? emptyStudent
      : students.find((student) => student.id === selectedId) ?? emptyStudent;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload: StudentInput = {
      studentName: String(form.get("studentName") ?? ""),
      schoolOrCoordinatorRegion: String(
        form.get("schoolOrCoordinatorRegion") ?? "",
      ),
      role: form.get("role") === "facilitator" ? "facilitator" : "student",
      projectLeader: form.get("projectLeader") === "yes",
    };
    const creating = selectedId === "new";
    if (selectedId === "grid") return;
    const response = await fetch(
      creating ? "/api/admin/students" : `/api/admin/students/${selectedId}`,
      {
        method: creating ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = (await response.json()) as {
      message?: string;
      error?: string;
      student?: Student;
    };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "The operation failed.");
    if (!response.ok || !result.student) return;
    setStudents((current) => {
      const next = creating
        ? [...current, result.student!].sort((a, b) =>
            a.studentName.localeCompare(b.studentName),
          )
        : current.map((student) =>
            student.id === result.student!.id ? result.student! : student,
          );
      onStudentsChange(next);
      return next;
    });
    setSelectedId(result.student.id);
  }

  async function remove() {
    if (selectedId === "new" || selectedId === "grid") return;
    const student = students.find((item) => item.id === selectedId);
    if (
      !window.confirm(
        locale === "tr"
          ? `${student?.studentName ?? "Bu öğrenci"} silinsin mi? Okul seçimlerinden de kaldırılacaktır.`
          : `Delete ${student?.studentName ?? "this student"}? They will also be removed from school selections.`,
      )
    ) {
      return;
    }
    setBusy(true);
    const response = await fetch(`/api/admin/students/${selectedId}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { message?: string; error?: string };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "The operation failed.");
    if (response.ok) {
      const remaining = students.filter((student) => student.id !== selectedId);
      setStudents(remaining);
      onStudentsChange(remaining);
      setSelectedId("grid");
    }
  }

  return (
    <div className="school-manager">
      <aside className="school-list">
        <div>
          <span>{locale === "tr" ? "ÖĞRENCİLER" : "STUDENTS"}</span>
          <strong>{students.length}</strong>
        </div>
        <button
          className={selectedId === "grid" ? "active" : ""}
          onClick={() => {
            setSelectedId("grid");
            setMessage("");
          }}
          type="button"
        >
          <b>▦</b> {locale === "tr" ? "Tüm öğrenciler" : "All students"}
        </button>
        <button
          className={selectedId === "new" ? "active" : ""}
          onClick={() => {
            setSelectedId("new");
            setMessage("");
          }}
          type="button"
        >
          <b>+</b> {locale === "tr" ? "Yeni öğrenci ekle" : "Add a student"}
        </button>
      </aside>
      {selectedId === "grid" ? (
        <StudentGrid
          locale={locale}
          onSelect={(id) => {
            setSelectedId(id);
            setMessage("");
          }}
          students={students}
        />
      ) : (
      <form className="school-form student-form" key={selectedId} onSubmit={save}>
        <div className="school-form-heading">
          <div>
            <button
              className="back-to-grid"
              onClick={() => setSelectedId("grid")}
              type="button"
            >
              ← {locale === "tr" ? "Tüm öğrenciler" : "All students"}
            </button>
            <span className="eyebrow">
              {selectedId === "new"
                ? locale === "tr" ? "Yeni kayıt" : "New record"
                : locale === "tr" ? "Öğrenci kaydı" : "Student record"}
            </span>
            <h2>
              {selectedId === "new"
                ? locale === "tr" ? "Öğrenci ekle" : "Add a student"
                : selected.studentName}
            </h2>
          </div>
          {selectedId !== "new" && (
            <button
              aria-label={locale === "tr" ? "Öğrenciyi sil" : "Delete student"}
              className="icon-danger-button"
              disabled={busy}
              onClick={() => void remove()}
              type="button"
            >
              <TrashIcon />
            </button>
          )}
        </div>
        <div className="student-field-grid">
          <div>
            <label htmlFor="studentName">
              {locale === "tr" ? "Öğrenci adı" : "Student Name"}
            </label>
            <input
              defaultValue={selected.studentName}
              id="studentName"
              name="studentName"
              required
            />
          </div>
          <div>
            <label htmlFor="schoolOrCoordinatorRegion">
              {locale === "tr"
                ? "Okul veya koordinatör bölgesi"
                : "School or Coordinator Region"}
            </label>
            <input
              defaultValue={selected.schoolOrCoordinatorRegion}
              id="schoolOrCoordinatorRegion"
              name="schoolOrCoordinatorRegion"
              required
            />
          </div>
          <div>
            <label htmlFor="role">{locale === "tr" ? "Rol" : "Role"}</label>
            <select defaultValue={selected.role} id="role" name="role">
              <option value="facilitator">
                {locale === "tr" ? "Yabancı Öğrenci" : "Facilitator"}
              </option>
              <option value="student">
                {locale === "tr" ? "Öğrenci" : "Student"}
              </option>
            </select>
          </div>
          <fieldset>
            <legend>
              {locale === "tr" ? "Proje lideri" : "Project Leader"}
            </legend>
            <label>
              <input
                defaultChecked={selected.projectLeader}
                name="projectLeader"
                type="radio"
                value="yes"
              />
              {locale === "tr" ? "Evet" : "Yes"}
            </label>
            <label>
              <input
                defaultChecked={!selected.projectLeader}
                name="projectLeader"
                type="radio"
                value="no"
              />
              {locale === "tr" ? "Hayır" : "No"}
            </label>
          </fieldset>
        </div>
        <div className="editor-footer">
          <span className="form-success" role="status">{message}</span>
          <button className="button button-primary" disabled={busy} type="submit">
            {busy
              ? locale === "tr" ? "Kaydediliyor..." : "Saving..."
              : locale === "tr" ? "Öğrenciyi kaydet" : "Save student"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}

function StudentGrid({
  locale,
  onSelect,
  students,
}: {
  locale: Locale;
  onSelect: (id: number) => void;
  students: Student[];
}) {
  if (students.length === 0) {
    return (
      <div className="school-grid-empty">
        <span>00</span>
        <h2>
          {locale === "tr" ? "Henüz öğrenci eklenmedi." : "No students yet."}
        </h2>
        <p>
          {locale === "tr"
            ? "Sol taraftaki Yeni öğrenci ekle bağlantısını kullanın."
            : "Use the Add a student link on the left."}
        </p>
      </div>
    );
  }

  return (
    <div className="school-card-grid student-card-grid">
      {students.map((student) => (
        <button
          className="school-info-card student-info-card"
          key={student.id}
          onClick={() => onSelect(student.id)}
          type="button"
        >
          <div className="school-card-title">
            <span>
              {student.studentName.slice(0, 2).toLocaleUpperCase("tr-TR")}
            </span>
            <div>
              <small>{locale === "tr" ? "ÖĞRENCİ" : "STUDENT"}</small>
              <h3>{student.studentName}</h3>
            </div>
          </div>
          <dl>
            <div>
              <dt>
                {locale === "tr"
                  ? "Okul / koordinatör bölgesi"
                  : "School / coordinator region"}
              </dt>
              <dd>{student.schoolOrCoordinatorRegion}</dd>
            </div>
            <div>
              <dt>{locale === "tr" ? "Rol" : "Role"}</dt>
              <dd>
                <span className={`role-pill role-${student.role}`}>
                  {student.role === "facilitator"
                    ? locale === "tr" ? "Yabancı Öğrenci" : "Facilitator"
                    : locale === "tr" ? "Öğrenci" : "Student"}
                </span>
              </dd>
            </div>
            <div>
              <dt>{locale === "tr" ? "Proje lideri" : "Project leader"}</dt>
              <dd>
                {student.projectLeader
                  ? locale === "tr" ? "Evet" : "Yes"
                  : locale === "tr" ? "Hayır" : "No"}
              </dd>
            </div>
          </dl>
          <span className="school-card-edit">
            {locale === "tr" ? "Düzenle →" : "Edit →"}
          </span>
        </button>
      ))}
    </div>
  );
}
