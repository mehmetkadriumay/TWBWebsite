"use client";

import { FormEvent, useState } from "react";
import { TrashIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import type {
  ForeignStudent,
  Student,
  StudentInput,
  StudentType,
  TurkishStudent,
} from "@/lib/types";

const emptyForeign: StudentInput = {
  studentType: "foreign",
  applicantFirstName: "",
  applicantLastName: "",
  applicantEmail: "",
  dateOfBirth: "",
  state: "",
  city: "",
  referrerFirstName: "",
  referrerLastName: "",
  referrerEmail: "",
  parentFirstName: "",
  parentLastName: "",
  parentEmail: "",
  parentPhone: "",
  details: "",
  projectLeader: false,
};

const emptyTurkish: StudentInput = {
  studentType: "turkish",
  teacherFirstName: "",
  teacherLastName: "",
  teacherEmail: "",
  teacherPhone: "",
  schoolName: "",
  province: "",
  district: "",
  principalName: "",
  studentCount: "",
  ageGroup: "",
  englishLevel: "",
  details: "",
  projectLeader: false,
};

type Selection = "tables" | "new-foreign" | "new-turkish" | `${StudentType}-${number}`;

function selectionFor(student: Student): `${StudentType}-${number}` {
  return `${student.studentType}-${student.id}`;
}

function Field({
  defaultValue,
  label,
  name,
  required = false,
  type = "text",
}: {
  defaultValue: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={`student-${name}`}>{label}</label>
      <input
        defaultValue={defaultValue}
        id={`student-${name}`}
        name={name}
        required={required}
        type={type}
      />
    </div>
  );
}

function studentInput(student: Student | undefined, type: StudentType): StudentInput {
  if (!student) return type === "foreign" ? emptyForeign : emptyTurkish;
  if (student.studentType === "foreign") {
    const {
      applicantFirstName,
      applicantLastName,
      applicantEmail,
      dateOfBirth,
      state,
      city,
      referrerFirstName,
      referrerLastName,
      referrerEmail,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      details,
      projectLeader,
    } = student;
    return {
      studentType: "foreign",
      applicantFirstName,
      applicantLastName,
      applicantEmail,
      dateOfBirth,
      state,
      city,
      referrerFirstName,
      referrerLastName,
      referrerEmail,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      details,
      projectLeader,
    };
  }
  const {
    teacherFirstName,
    teacherLastName,
    teacherEmail,
    teacherPhone,
    schoolName,
    province,
    district,
    principalName,
    studentCount,
    ageGroup,
    englishLevel,
    details,
    projectLeader,
  } = student;
  return {
    studentType: "turkish",
    teacherFirstName,
    teacherLastName,
    teacherEmail,
    teacherPhone,
    schoolName,
    province,
    district,
    principalName,
    studentCount,
    ageGroup,
    englishLevel,
    details,
    projectLeader,
  };
}

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
  const [selection, setSelection] = useState<Selection>("tables");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected = students.find((student) => selectionFor(student) === selection);
  const type: StudentType =
    selection === "new-foreign" || selection.startsWith("foreign-")
      ? "foreign"
      : "turkish";
  const input = studentInput(selected, type);
  const creating = selection === "new-foreign" || selection === "new-turkish";

  function updateStudents(next: Student[]) {
    setStudents(next);
    onStudentsChange(next);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selection === "tables") return;
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "");
    const payload: StudentInput =
      type === "foreign"
        ? {
            studentType: "foreign",
            applicantFirstName: value("applicantFirstName"),
            applicantLastName: value("applicantLastName"),
            applicantEmail: value("applicantEmail"),
            dateOfBirth: value("dateOfBirth"),
            state: value("state"),
            city: value("city"),
            referrerFirstName: value("referrerFirstName"),
            referrerLastName: value("referrerLastName"),
            referrerEmail: value("referrerEmail"),
            parentFirstName: value("parentFirstName"),
            parentLastName: value("parentLastName"),
            parentEmail: value("parentEmail"),
            parentPhone: value("parentPhone"),
            details: value("details"),
            projectLeader: form.get("projectLeader") === "yes",
          }
        : {
            studentType: "turkish",
            teacherFirstName: value("teacherFirstName"),
            teacherLastName: value("teacherLastName"),
            teacherEmail: value("teacherEmail"),
            teacherPhone: value("teacherPhone"),
            schoolName: value("schoolName"),
            province: value("province"),
            district: value("district"),
            principalName: value("principalName"),
            studentCount: value("studentCount"),
            ageGroup: value("ageGroup"),
            englishLevel: value("englishLevel"),
            details: value("details"),
            projectLeader: form.get("projectLeader") === "yes",
          };
    const response = await fetch(
      creating ? "/api/admin/students" : `/api/admin/students/${selected!.id}`,
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
    setMessage(result.message ?? result.error ?? "");
    if (!response.ok || !result.student) return;
    const next = creating
      ? [...students, result.student]
      : students.map((student) =>
          selectionFor(student) === selection ? result.student! : student,
        );
    updateStudents(next);
    setSelection(selectionFor(result.student));
  }

  async function remove() {
    if (!selected) return;
    if (
      !window.confirm(
        locale === "tr"
          ? `${selected.studentName} silinsin mi?`
          : `Delete ${selected.studentName}?`,
      )
    ) return;
    setBusy(true);
    const response = await fetch(
      `/api/admin/students/${selected.id}?type=${selected.studentType}`,
      { method: "DELETE" },
    );
    const result = (await response.json()) as { message?: string; error?: string };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "");
    if (response.ok) {
      updateStudents(
        students.filter((student) => selectionFor(student) !== selection),
      );
      setSelection("tables");
    }
  }

  return (
    <div className="student-manager">
      <div className="student-manager-actions">
        <button
          className={selection === "tables" ? "active" : ""}
          onClick={() => setSelection("tables")}
          type="button"
        >
          {locale === "tr" ? "İki öğrenci tablosu" : "Student tables"}
        </button>
        <button onClick={() => setSelection("new-turkish")} type="button">
          + {locale === "tr" ? "Türk öğrenci grubu" : "Turkish student group"}
        </button>
        <button onClick={() => setSelection("new-foreign")} type="button">
          + {locale === "tr" ? "Yabancı öğrenci" : "Foreign student"}
        </button>
      </div>

      {selection === "tables" ? (
        <div className="student-table-stack">
          <StudentTable
            locale={locale}
            onSelect={setSelection}
            students={students.filter(
              (student): student is TurkishStudent =>
                student.studentType === "turkish",
            )}
            type="turkish"
          />
          <StudentTable
            locale={locale}
            onSelect={setSelection}
            students={students.filter(
              (student): student is ForeignStudent =>
                student.studentType === "foreign",
            )}
            type="foreign"
          />
        </div>
      ) : (
        <form className="school-form student-form" key={selection} onSubmit={save}>
          <div className="school-form-heading">
            <div>
              <button className="back-to-grid" onClick={() => setSelection("tables")} type="button">
                ← {locale === "tr" ? "Öğrenci tabloları" : "Student tables"}
              </button>
              <span className="eyebrow">
                {type === "foreign"
                  ? locale === "tr" ? "Yabancı öğrenci" : "Foreign student"
                  : locale === "tr" ? "Türk öğrenci grubu" : "Turkish student group"}
              </span>
              <h2>
                {creating
                  ? locale === "tr" ? "Yeni kayıt" : "New record"
                  : selected?.studentName}
              </h2>
            </div>
            {!creating && (
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

          {input.studentType === "foreign" ? (
            <ForeignFields locale={locale} student={input} />
          ) : (
            <TurkishFields locale={locale} student={input} />
          )}

          <fieldset className="project-leader-field">
            <legend>{locale === "tr" ? "Proje lideri" : "Project leader"}</legend>
            <label><input defaultChecked={input.projectLeader} name="projectLeader" type="radio" value="yes" /> {locale === "tr" ? "Evet" : "Yes"}</label>
            <label><input defaultChecked={!input.projectLeader} name="projectLeader" type="radio" value="no" /> {locale === "tr" ? "Hayır" : "No"}</label>
          </fieldset>
          <div className="editor-footer">
            <span className="form-success" role="status">{message}</span>
            <button className="button button-primary" disabled={busy} type="submit">
              {busy
                ? locale === "tr" ? "Kaydediliyor..." : "Saving..."
                : locale === "tr" ? "Kaydet" : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ForeignFields({
  locale,
  student,
}: {
  locale: Locale;
  student: Extract<StudentInput, { studentType: "foreign" }>;
}) {
  const tr = locale === "tr";
  return (
    <div className="student-field-sections">
      <fieldset>
        <legend>{tr ? "Öğrenci bilgileri" : "Applicant information"}</legend>
        <div className="student-field-grid">
          <Field defaultValue={student.applicantFirstName} label={tr ? "Adı" : "First name"} name="applicantFirstName" required />
          <Field defaultValue={student.applicantLastName} label={tr ? "Soyadı" : "Last name"} name="applicantLastName" required />
          <Field defaultValue={student.applicantEmail} label={tr ? "E-posta" : "Email"} name="applicantEmail" required type="email" />
          <Field defaultValue={student.dateOfBirth} label={tr ? "Doğum tarihi" : "Date of birth"} name="dateOfBirth" type="date" />
          <Field defaultValue={student.state} label={tr ? "Eyalet" : "State"} name="state" required />
          <Field defaultValue={student.city} label={tr ? "Şehir" : "City"} name="city" required />
        </div>
      </fieldset>
      <fieldset>
        <legend>{tr ? "Referans veren kişi" : "Referring person"}</legend>
        <div className="student-field-grid">
          <Field defaultValue={student.referrerFirstName} label={tr ? "Adı" : "First name"} name="referrerFirstName" />
          <Field defaultValue={student.referrerLastName} label={tr ? "Soyadı" : "Last name"} name="referrerLastName" />
          <Field defaultValue={student.referrerEmail} label={tr ? "E-posta" : "Email"} name="referrerEmail" type="email" />
        </div>
      </fieldset>
      <fieldset>
        <legend>{tr ? "Veli bilgileri" : "Parent or guardian"}</legend>
        <div className="student-field-grid">
          <Field defaultValue={student.parentFirstName} label={tr ? "Adı" : "First name"} name="parentFirstName" />
          <Field defaultValue={student.parentLastName} label={tr ? "Soyadı" : "Last name"} name="parentLastName" />
          <Field defaultValue={student.parentEmail} label={tr ? "E-posta" : "Email"} name="parentEmail" type="email" />
          <Field defaultValue={student.parentPhone} label={tr ? "Telefon" : "Phone"} name="parentPhone" type="tel" />
        </div>
      </fieldset>
      <label className="student-details-field">
        <span>{tr ? "Ek bilgiler" : "Additional details"}</span>
        <textarea defaultValue={student.details} name="details" rows={5} />
      </label>
    </div>
  );
}

function TurkishFields({
  locale,
  student,
}: {
  locale: Locale;
  student: Extract<StudentInput, { studentType: "turkish" }>;
}) {
  const tr = locale === "tr";
  return (
    <div className="student-field-sections">
      <fieldset>
        <legend>{tr ? "Başvuruyu yapan öğretmen" : "Applying teacher"}</legend>
        <div className="student-field-grid">
          <Field defaultValue={student.teacherFirstName} label={tr ? "Adı" : "First name"} name="teacherFirstName" required />
          <Field defaultValue={student.teacherLastName} label={tr ? "Soyadı" : "Last name"} name="teacherLastName" required />
          <Field defaultValue={student.teacherEmail} label={tr ? "E-posta" : "Email"} name="teacherEmail" required type="email" />
          <Field defaultValue={student.teacherPhone} label={tr ? "Telefon" : "Phone"} name="teacherPhone" type="tel" />
        </div>
      </fieldset>
      <fieldset>
        <legend>{tr ? "Okul bilgileri" : "School information"}</legend>
        <div className="student-field-grid">
          <Field defaultValue={student.schoolName} label={tr ? "Okul adı" : "School name"} name="schoolName" required />
          <Field defaultValue={student.province} label={tr ? "İl" : "Province"} name="province" required />
          <Field defaultValue={student.district} label={tr ? "İlçe" : "District"} name="district" />
          <Field defaultValue={student.principalName} label={tr ? "Okul müdürü" : "Principal"} name="principalName" />
        </div>
      </fieldset>
      <fieldset>
        <legend>{tr ? "Öğrenci grubu" : "Student group"}</legend>
        <div className="student-field-grid">
          <Field defaultValue={student.studentCount} label={tr ? "Öğrenci sayısı" : "Student count"} name="studentCount" type="number" />
          <Field defaultValue={student.ageGroup} label={tr ? "Yaş grubu" : "Age group"} name="ageGroup" />
          <Field defaultValue={student.englishLevel} label={tr ? "İngilizce seviyesi" : "English level"} name="englishLevel" />
        </div>
      </fieldset>
      <label className="student-details-field">
        <span>{tr ? "Ek bilgiler" : "Additional details"}</span>
        <textarea defaultValue={student.details} name="details" rows={5} />
      </label>
    </div>
  );
}

function StudentTable({
  locale,
  onSelect,
  students,
  type,
}: {
  locale: Locale;
  onSelect: (selection: Selection) => void;
  students: ForeignStudent[] | TurkishStudent[];
  type: StudentType;
}) {
  const tr = locale === "tr";
  return (
    <section className="student-table-panel">
      <header>
        <div>
          <span>{type === "foreign" ? "US" : "TR"}</span>
          <div>
            <small>{type === "foreign" ? (tr ? "YABANCI ÖĞRENCİLER" : "FOREIGN STUDENTS") : (tr ? "TÜRK ÖĞRENCİ GRUPLARI" : "TURKISH STUDENT GROUPS")}</small>
            <h2>{students.length} {tr ? "kayıt" : "records"}</h2>
          </div>
        </div>
      </header>
      <div className="student-table-scroll">
        <table>
          <thead>
            <tr>
              <th>{tr ? "Ad / Öğretmen" : "Name / Teacher"}</th>
              <th>{type === "foreign" ? (tr ? "Şehir / Eyalet" : "City / State") : (tr ? "Okul / İl" : "School / Province")}</th>
              <th>{tr ? "E-posta" : "Email"}</th>
              <th>{tr ? "Başvuru" : "Application"}</th>
              <th><span className="sr-only">{tr ? "İşlem" : "Action"}</span></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={5}>{tr ? "Henüz kayıt yok." : "No records yet."}</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td><strong>{student.studentName}</strong></td>
                  <td>{student.schoolOrCoordinatorRegion || "—"}</td>
                  <td>{student.studentType === "foreign" ? student.applicantEmail : student.teacherEmail}</td>
                  <td>{student.applicationId ? `#${student.applicationId}` : "—"}</td>
                  <td>
                    <button onClick={() => onSelect(selectionFor(student))} type="button">
                      {tr ? "Düzenle" : "Edit"} →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
