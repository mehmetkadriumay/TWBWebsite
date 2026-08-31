"use client";

import { FormEvent, useState } from "react";
import { TrashIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import type { School, SchoolInput, Student } from "@/lib/types";

const emptySchool: SchoolInput = {
  schoolName: "",
  coordinatorName: "",
  responsibleTeacherName: "",
  foreignStudentIds: [],
  turkishStudentIds: [],
  coordinatorWhatsappGroupName: "",
  studentWhatsappGroupName: "",
  meetingLink: "",
};

const labels = {
  schoolName: ["Okul adı", "School name"],
  coordinatorName: ["Koordinatör adı", "Coordinator name"],
  responsibleTeacherName: ["Sorumlu öğretmen adı", "Responsible teacher name"],
  coordinatorWhatsappGroupName: [
    "Koordinatör WhatsApp grup adı",
    "Coordinator WhatsApp group name",
  ],
  studentWhatsappGroupName: [
    "Öğrenci WhatsApp grup adı",
    "Student WhatsApp group name",
  ],
  meetingLink: ["Toplantı bağlantısı", "Meeting link"],
} satisfies Partial<Record<keyof SchoolInput, [string, string]>>;

const textFields: Array<Exclude<
  keyof SchoolInput,
  "foreignStudentIds" | "turkishStudentIds"
>> = [
  "schoolName",
  "coordinatorName",
  "responsibleTeacherName",
  "coordinatorWhatsappGroupName",
  "studentWhatsappGroupName",
  "meetingLink",
];

export function SchoolManagement({
  initialSchools,
  locale,
  students,
}: {
  initialSchools: School[];
  locale: Locale;
  students: Student[];
}) {
  const [schools, setSchools] = useState(initialSchools);
  const [selectedId, setSelectedId] = useState<number | "new" | "grid">("grid");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected =
    selectedId === "new" || selectedId === "grid"
      ? emptySchool
      : schools.find((school) => school.id === selectedId) ?? emptySchool;
  const languageIndex = locale === "tr" ? 0 : 1;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(
        textFields.map((key) => [key, form.get(key) ?? ""]),
      ),
      foreignStudentIds: form
        .getAll("foreignStudentIds")
        .map((id) => Number(id)),
      turkishStudentIds: form
        .getAll("turkishStudentIds")
        .map((id) => Number(id)),
    } as SchoolInput;
    const creating = selectedId === "new";
    if (selectedId === "grid") return;
    const response = await fetch(
      creating ? "/api/admin/schools" : `/api/admin/schools/${selectedId}`,
      {
        method: creating ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = (await response.json()) as {
      message?: string;
      error?: string;
      school?: School;
    };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "The operation failed.");
    if (!response.ok || !result.school) return;
    setSchools((current) =>
      creating
        ? [...current, result.school!].sort((a, b) =>
            a.schoolName.localeCompare(b.schoolName),
          )
        : current.map((school) =>
            school.id === result.school!.id ? result.school! : school,
          ),
    );
    setSelectedId(result.school.id);
  }

  async function remove() {
    if (selectedId === "new" || selectedId === "grid") return;
    const school = schools.find((item) => item.id === selectedId);
    const confirmed = window.confirm(
      locale === "tr"
        ? `${school?.schoolName ?? "Bu okul"} silinsin mi?`
        : `Delete ${school?.schoolName ?? "this school"}?`,
    );
    if (!confirmed) return;
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/admin/schools/${selectedId}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { message?: string; error?: string };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "The operation failed.");
    if (response.ok) {
      const remaining = schools.filter((school) => school.id !== selectedId);
      setSchools(remaining);
      setSelectedId("grid");
    }
  }

  return (
    <div className="school-manager">
      <aside className="school-list">
        <div>
          <span>{locale === "tr" ? "OKULLAR" : "SCHOOLS"}</span>
          <strong>{schools.length}</strong>
        </div>
        <button
          className={selectedId === "grid" ? "active" : ""}
          onClick={() => {
            setSelectedId("grid");
            setMessage("");
          }}
          type="button"
        >
          <b>▦</b> {locale === "tr" ? "Tüm okullar" : "All schools"}
        </button>
        <button
          className={selectedId === "new" ? "active" : ""}
          onClick={() => {
            setSelectedId("new");
            setMessage("");
          }}
          type="button"
        >
          <b>+</b> {locale === "tr" ? "Yeni okul ekle" : "Add a school"}
        </button>
      </aside>
      {selectedId === "grid" ? (
        <SchoolGrid
          locale={locale}
          onSelect={(id) => {
            setSelectedId(id);
            setMessage("");
          }}
          schools={schools}
          students={students}
        />
      ) : (
      <form className="school-form" key={selectedId} onSubmit={save}>
        <div className="school-form-heading">
          <div>
            <button
              className="back-to-grid"
              onClick={() => setSelectedId("grid")}
              type="button"
            >
              ← {locale === "tr" ? "Tüm okullar" : "All schools"}
            </button>
            <span className="eyebrow">
              {selectedId === "new"
                ? locale === "tr" ? "Yeni kayıt" : "New record"
                : locale === "tr" ? "Okul kaydı" : "School record"}
            </span>
            <h2>
              {selectedId === "new"
                ? locale === "tr" ? "Okul ekle" : "Add a school"
                : selected.schoolName}
            </h2>
          </div>
          {selectedId !== "new" && (
            <button
              aria-label={locale === "tr" ? "Okulu sil" : "Delete school"}
              className="icon-danger-button"
              disabled={busy}
              onClick={() => void remove()}
              type="button"
            >
              <TrashIcon />
            </button>
          )}
        </div>
        <div className="school-field-grid">
          {textFields.map((key) => {
            return (
              <div key={key}>
                <label htmlFor={`school-${key}`}>{labels[key]![languageIndex]}</label>
                <input
                  defaultValue={selected[key]}
                  id={`school-${key}`}
                  name={key}
                  required={key === "schoolName"}
                  type={key === "meetingLink" ? "url" : "text"}
                />
              </div>
            );
          })}
          <StudentSelector
            locale={locale}
            name="foreignStudentIds"
            selectedIds={selected.foreignStudentIds}
            students={students.filter((student) => student.role === "facilitator")}
            title={locale === "tr" ? "Yabancı öğrenciler" : "Foreign students"}
          />
          <StudentSelector
            locale={locale}
            name="turkishStudentIds"
            selectedIds={selected.turkishStudentIds}
            students={students.filter((student) => student.role === "student")}
            title={locale === "tr" ? "Türk öğrenciler" : "Turkish students"}
          />
        </div>
        <div className="editor-footer">
          <span className="form-success" role="status">{message}</span>
          <button className="button button-primary" disabled={busy} type="submit">
            {busy
              ? locale === "tr" ? "Kaydediliyor..." : "Saving..."
              : locale === "tr" ? "Okulu kaydet" : "Save school"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}

function SchoolGrid({
  locale,
  onSelect,
  schools,
  students,
}: {
  locale: Locale;
  onSelect: (id: number) => void;
  schools: School[];
  students: Student[];
}) {
  const studentNames = (ids: number[]) =>
    ids
      .map((id) => students.find((student) => student.id === id)?.studentName)
      .filter(Boolean)
      .join(", ") || "—";

  if (schools.length === 0) {
    return (
      <div className="school-grid-empty">
        <span>00</span>
        <h2>{locale === "tr" ? "Henüz okul eklenmedi." : "No schools yet."}</h2>
        <p>
          {locale === "tr"
            ? "Sol taraftaki Yeni okul ekle bağlantısını kullanın."
            : "Use the Add a school link on the left."}
        </p>
      </div>
    );
  }

  return (
    <div className="school-card-grid">
      {schools.map((school) => (
        <button
          className="school-info-card"
          key={school.id}
          onClick={() => onSelect(school.id)}
          type="button"
        >
          <div className="school-card-title">
            <span>{school.schoolName.slice(0, 2).toLocaleUpperCase("tr-TR")}</span>
            <div>
              <small>{locale === "tr" ? "OKUL" : "SCHOOL"}</small>
              <h3>{school.schoolName}</h3>
            </div>
          </div>
          <dl>
            <div>
              <dt>{locale === "tr" ? "Koordinatör" : "Coordinator"}</dt>
              <dd>{school.coordinatorName || "—"}</dd>
            </div>
            <div>
              <dt>{locale === "tr" ? "Sorumlu öğretmen" : "Responsible teacher"}</dt>
              <dd>{school.responsibleTeacherName || "—"}</dd>
            </div>
            <div>
              <dt>{locale === "tr" ? "Yabancı öğrenciler" : "Foreign students"}</dt>
              <dd>{studentNames(school.foreignStudentIds)}</dd>
            </div>
            <div>
              <dt>{locale === "tr" ? "Türk öğrenciler" : "Turkish students"}</dt>
              <dd>{studentNames(school.turkishStudentIds)}</dd>
            </div>
            <div>
              <dt>{locale === "tr" ? "Koordinatör WhatsApp" : "Coordinator WhatsApp"}</dt>
              <dd>{school.coordinatorWhatsappGroupName || "—"}</dd>
            </div>
            <div>
              <dt>{locale === "tr" ? "Öğrenci WhatsApp" : "Student WhatsApp"}</dt>
              <dd>{school.studentWhatsappGroupName || "—"}</dd>
            </div>
            <div className="meeting-row">
              <dt>{locale === "tr" ? "Toplantı bağlantısı" : "Meeting link"}</dt>
              <dd>{school.meetingLink || "—"}</dd>
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

function StudentSelector({
  locale,
  name,
  selectedIds,
  students,
  title,
}: {
  locale: Locale;
  name: "foreignStudentIds" | "turkishStudentIds";
  selectedIds: number[];
  students: Student[];
  title: string;
}) {
  return (
    <fieldset className="student-selector">
      <legend>{title}</legend>
      {students.length > 0 ? (
        students.map((student) => (
          <label key={student.id}>
            <input
              defaultChecked={selectedIds.includes(student.id)}
              name={name}
              type="checkbox"
              value={student.id}
            />
            <span>
              <strong>{student.studentName}</strong>
              <small>{student.schoolOrCoordinatorRegion}</small>
            </span>
          </label>
        ))
      ) : (
        <p>
          {locale === "tr"
            ? "Bu role uygun öğrenci bulunamadı."
            : "No students match this role."}
        </p>
      )}
    </fieldset>
  );
}
