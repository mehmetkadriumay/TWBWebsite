"use client";

import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { AcademicCalendar } from "@/lib/types";

const fields = [
  ["semester1Start", "Semester 1 Start", "1. Dönem Başlangıç"],
  ["semester1End", "Semester 1 End", "1. Dönem Bitiş"],
  ["semester2Start", "Semester 2 Start", "2. Dönem Başlangıç"],
  ["semester2End", "Semester 2 End", "2. Dönem Bitiş"],
] as const;

export function TimeManagement({
  calendar,
  locale,
}: {
  calendar: AcademicCalendar;
  locale: Locale;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/calendar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.fromEntries(fields.map(([key]) => [key, form.get(key)])),
      ),
    });
    const result = (await response.json()) as { message?: string; error?: string };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "The operation failed.");
  }

  return (
    <form className="calendar-form" onSubmit={save}>
      <div className="calendar-intro">
        <div>
          <span className="eyebrow">
            {locale === "tr" ? "Akademik takvim" : "Academic calendar"}
          </span>
          <h2>{locale === "tr" ? "Hafta tarihlerini yönet" : "Manage weekly dates"}</h2>
        </div>
        <p>
          {locale === "tr"
            ? "Haftalar 1. dönem başlangıcından yedişer gün ilerler. İlk dönem bittiğinde sonraki hafta 2. dönem başlangıcına atlar."
            : "Weeks advance every seven days from Semester 1. After its end date, the next week jumps to the Semester 2 start date."}
        </p>
      </div>
      <div className="calendar-fields">
        {fields.map(([key, english, turkish]) => (
          <div key={key}>
            <label htmlFor={key}>{locale === "tr" ? turkish : english}</label>
            <input
              defaultValue={calendar[key]}
              id={key}
              name={key}
              required
              type="date"
            />
          </div>
        ))}
      </div>
      <div className="editor-footer">
        <span className="form-success" role="status">{message}</span>
        <button className="button button-primary" disabled={busy} type="submit">
          {busy
            ? locale === "tr" ? "Kaydediliyor..." : "Saving..."
            : locale === "tr" ? "Tarihleri kaydet" : "Save dates"}
        </button>
      </div>
    </form>
  );
}
