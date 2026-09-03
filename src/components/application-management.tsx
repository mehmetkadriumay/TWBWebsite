"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { ParticipationApplication } from "@/lib/types";

const fieldLabels: Record<string, [string, string]> = {
  teacherFirstName: ["Öğretmen adı", "Teacher first name"],
  teacherLastName: ["Öğretmen soyadı", "Teacher last name"],
  teacherEmail: ["Öğretmen e-postası", "Teacher email"],
  teacherPhone: ["Öğretmen telefonu", "Teacher phone"],
  schoolName: ["Okul adı", "School name"],
  province: ["İl", "Province"],
  district: ["İlçe", "District"],
  principalName: ["Okul müdürü", "Principal"],
  studentCount: ["Öğrenci sayısı", "Student count"],
  ageGroup: ["Yaş grubu", "Age group"],
  englishLevel: ["İngilizce seviyesi", "English level"],
  applicantFirstName: ["Öğrenci adı", "Applicant first name"],
  applicantLastName: ["Öğrenci soyadı", "Applicant last name"],
  applicantEmail: ["Öğrenci e-postası", "Applicant email"],
  dateOfBirth: ["Doğum tarihi", "Date of birth"],
  state: ["Eyalet", "State"],
  city: ["Şehir", "City"],
  referrerFirstName: ["Referans adı", "Referrer first name"],
  referrerLastName: ["Referans soyadı", "Referrer last name"],
  referrerEmail: ["Referans e-postası", "Referrer email"],
  parentFirstName: ["Veli adı", "Parent first name"],
  parentLastName: ["Veli soyadı", "Parent last name"],
  parentEmail: ["Veli e-postası", "Parent email"],
  parentPhone: ["Veli telefonu", "Parent phone"],
  details: ["Ek bilgiler", "Additional details"],
  consent: ["Veri kullanım izni", "Data consent"],
};

function applicationName(application: ParticipationApplication): string {
  const fields = application.fields;
  return application.formType === "us"
    ? `${fields.applicantFirstName ?? ""} ${fields.applicantLastName ?? ""}`.trim()
    : `${fields.teacherFirstName ?? ""} ${fields.teacherLastName ?? ""}`.trim();
}

export function ApplicationManagement({
  initialApplications,
  locale,
}: {
  initialApplications: ParticipationApplication[];
  locale: Locale;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const languageIndex = locale === "tr" ? 0 : 1;

  async function review(id: number, decision: "approve" | "reject") {
    setBusyId(id);
    setMessage("");
    const response = await fetch(`/api/admin/applications/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const result = (await response.json()) as {
      application?: ParticipationApplication;
      message?: string;
      error?: string;
    };
    setBusyId(null);
    setMessage(result.message ?? result.error ?? "");
    if (response.ok && result.application) {
      setApplications((current) =>
        current.map((application) =>
          application.id === id ? result.application! : application,
        ),
      );
    }
  }

  async function remove(application: ParticipationApplication) {
    const confirmed = window.confirm(
      locale === "tr"
        ? `${applicationName(application)} için onaylanmış başvuruyu ve bağlı öğrenci kaydını silmek istediğinizden emin misiniz?`
        : `Are you sure you want to delete the approved application for ${applicationName(application)} and its linked student record?`,
    );
    if (!confirmed) return;

    setBusyId(application.id);
    setMessage("");
    const response = await fetch(`/api/admin/applications/${application.id}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as {
      message?: string;
      error?: string;
    };
    setBusyId(null);
    setMessage(result.message ?? result.error ?? "");
    if (response.ok) {
      setApplications((current) =>
        current.filter((item) => item.id !== application.id),
      );
    }
  }

  if (applications.length === 0) {
    return (
      <div className="application-review-empty">
        <span>00</span>
        <h2>{locale === "tr" ? "Henüz başvuru yok." : "No applications yet."}</h2>
      </div>
    );
  }

  return (
    <div className="application-review">
      {message && <p className="application-review-message" role="status">{message}</p>}
      <div className="application-review-list">
        {applications.map((application) => (
          <article className="application-review-card" key={application.id}>
            <header>
              <div>
                <span className={`application-status status-${application.status}`}>
                  {application.status === "pending"
                    ? locale === "tr" ? "Bekliyor" : "Pending"
                    : application.status === "approved"
                      ? locale === "tr" ? "Onaylandı" : "Approved"
                      : locale === "tr" ? "Reddedildi" : "Rejected"}
                </span>
                <small>
                  {application.formType === "us"
                    ? locale === "tr" ? "Yabancı öğrenci başvurusu" : "Foreign student application"
                    : locale === "tr" ? "Türk öğrenci grubu başvurusu" : "Turkish student group application"}
                </small>
                <h2>{applicationName(application) || `#${application.id}`}</h2>
              </div>
              <time dateTime={application.submittedAt}>
                {new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(application.submittedAt))}
              </time>
            </header>
            <dl>
              {Object.entries(application.fields)
                .filter(([key, value]) => key !== "website" && value)
                .map(([key, value]) => (
                  <div className={key === "details" ? "wide" : ""} key={key}>
                    <dt>{fieldLabels[key]?.[languageIndex] ?? key}</dt>
                    <dd>{value === "yes" ? (locale === "tr" ? "Evet" : "Yes") : value}</dd>
                  </div>
                ))}
            </dl>
            <footer>
              {application.status === "pending" ? (
                <>
                  <button
                    className="button application-reject"
                    disabled={busyId === application.id}
                    onClick={() => void review(application.id, "reject")}
                    type="button"
                  >
                    {locale === "tr" ? "Reddet" : "Reject"}
                  </button>
                  <button
                    className="button button-primary"
                    disabled={busyId === application.id}
                    onClick={() => void review(application.id, "approve")}
                    type="button"
                  >
                    {busyId === application.id
                      ? locale === "tr" ? "İşleniyor..." : "Processing..."
                      : locale === "tr" ? "Onayla" : "Approve"}
                  </button>
                </>
              ) : (
                <>
                  <span>
                    {application.status === "approved"
                      ? locale === "tr"
                        ? `${application.studentType === "foreign" ? "Yabancı" : "Türk"} öğrenci kaydı #${application.studentId} oluşturuldu.`
                        : `${application.studentType === "foreign" ? "Foreign" : "Turkish"} student record #${application.studentId} created.`
                      : locale === "tr" ? "Başvuru reddedildi." : "Application rejected."}
                  </span>
                  {application.status === "approved" && (
                    <button
                      className="button application-delete"
                      disabled={busyId === application.id}
                      onClick={() => void remove(application)}
                      type="button"
                    >
                      {busyId === application.id
                        ? locale === "tr" ? "Siliniyor..." : "Deleting..."
                        : locale === "tr" ? "Sil" : "Delete"}
                    </button>
                  )}
                </>
              )}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
