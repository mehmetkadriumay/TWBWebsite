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
  const [documentBusyId, setDocumentBusyId] = useState<number | null>(null);
  const [hideRejected, setHideRejected] = useState(false);
  const [message, setMessage] = useState("");
  const languageIndex = locale === "tr" ? 0 : 1;
  const visibleApplications = hideRejected
    ? applications.filter((application) => application.status !== "rejected")
    : applications;

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

  async function openDocument(
    application: ParticipationApplication,
    action: "download" | "print",
  ) {
    const printWindow =
      action === "print"
        ? window.open("", "twb-turkiye-application-print")
        : null;
    if (action === "print" && !printWindow) {
      setMessage(
        locale === "tr"
          ? "Yazdırma penceresi açılamadı. Tarayıcınızda açılır pencerelere izin verip tekrar deneyin."
          : "The print window could not be opened. Allow pop-ups in your browser and try again.",
      );
      return;
    }
    if (printWindow) {
      printWindow.document.write(
        `<p style="font:16px Arial;padding:24px">${
          locale === "tr" ? "Belge hazırlanıyor..." : "Preparing document..."
        }</p>`,
      );
      printWindow.document.close();
    }

    setDocumentBusyId(application.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/applications/${application.id}`);
      const result = (await response.json()) as {
        documentUrl?: string;
        printUrl?: string;
        error?: string;
      };
      if (!response.ok || !result.documentUrl || !result.printUrl) {
        printWindow?.close();
        setMessage(
          result.error ??
            (locale === "tr"
              ? "Belge hazırlanamadı."
              : "The document could not be prepared."),
        );
        return;
      }
      if (action === "print" && printWindow) {
        printWindow.location.href = result.printUrl;
        return;
      }
      const download = document.createElement("a");
      download.href = result.documentUrl;
      download.download = "";
      document.body.appendChild(download);
      download.click();
      download.remove();
    } catch {
      printWindow?.close();
      setMessage(
        locale === "tr"
          ? "Belge hazırlanamadı. Bağlantınızı kontrol edip tekrar deneyin."
          : "The document could not be prepared. Check your connection and try again.",
      );
    } finally {
      setDocumentBusyId(null);
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
      <label className="application-review-filter">
        <input
          checked={hideRejected}
          onChange={(event) => setHideRejected(event.target.checked)}
          type="checkbox"
        />
        <span>
          {locale === "tr"
            ? "Reddedilen başvuruları gizle"
            : "Hide rejected applications"}
        </span>
      </label>
      <div className="application-review-list">
        {visibleApplications.length === 0 && (
          <div className="application-review-empty">
            <span>00</span>
            <h2>
              {locale === "tr"
                ? "Filtreye uygun başvuru yok."
                : "No applications match this filter."}
            </h2>
          </div>
        )}
        {visibleApplications.map((application) => (
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
                    <>
                      {application.formType === "turkiye" && (
                        <div className="application-document-actions">
                          <button
                            className="button button-secondary"
                            disabled={documentBusyId === application.id}
                            onClick={() =>
                              void openDocument(application, "download")
                            }
                            type="button"
                          >
                            {locale === "tr"
                              ? "Word belgesini indir"
                              : "Download Word document"}
                          </button>
                          <button
                            className="button button-primary"
                            disabled={documentBusyId === application.id}
                            onClick={() =>
                              void openDocument(application, "print")
                            }
                            type="button"
                          >
                            {documentBusyId === application.id
                              ? locale === "tr"
                                ? "Hazırlanıyor..."
                                : "Preparing..."
                              : locale === "tr"
                                ? "Yazdır"
                                : "Print"}
                          </button>
                        </div>
                      )}
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
                    </>
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
