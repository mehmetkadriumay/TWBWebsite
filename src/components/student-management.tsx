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
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialStudents[0]?.id ?? "new",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected =
    selectedId === "new"
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
    if (selectedId === "new") return;
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
      setSelectedId(remaining[0]?.id ?? "new");
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
          className={selectedId === "new" ? "active" : ""}
          onClick={() => {
            setSelectedId("new");
            setMessage("");
          }}
          type="button"
        >
          <b>+</b> {locale === "tr" ? "Yeni öğrenci ekle" : "Add a student"}
        </button>
        {students.map((student) => (
          <button
            className={selectedId === student.id ? "active" : ""}
            key={student.id}
            onClick={() => {
              setSelectedId(student.id);
              setMessage("");
            }}
            type="button"
          >
            <b>{student.studentName.slice(0, 2).toLocaleUpperCase("tr-TR")}</b>
            <span>{student.studentName}</span>
          </button>
        ))}
      </aside>
      <form className="school-form student-form" key={selectedId} onSubmit={save}>
        <div className="school-form-heading">
          <div>
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
                {locale === "tr" ? "Kolaylaştırıcı" : "Facilitator"}
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
    </div>
  );
}
