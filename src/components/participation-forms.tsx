"use client";

import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/i18n";

const turkishProvinces = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya",
  "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir",
  "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu",
  "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum",
  "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay",
  "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük",
  "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale",
  "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya",
  "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde",
  "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
  "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon",
  "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
];

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];

type FormType = "turkiye" | "us";

function Field({
  label,
  name,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span>{label}{required && " *"}</span>
      <input name={name} required={required} type={type} />
    </label>
  );
}

function ApplicationForm({
  children,
  copy,
  formType,
  locale,
}: {
  children: React.ReactNode;
  copy: Record<string, string>;
  formType: FormType;
  locale: Locale;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formType, locale, fields: values }),
    });
    const result = (await response.json()) as { message?: string; error?: string };
    setMessage(result.message ?? result.error ?? "");
    setSubmitting(false);
    if (response.ok) {
      form.reset();
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="application-success" role="status">
        <span aria-hidden="true">✓</span>
        <h4>{copy.thankYou}</h4>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form className="participation-form" onSubmit={submit}>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="form-honeypot"
        name="website"
        tabIndex={-1}
        type="text"
      />
      {children}
      <label className="form-consent">
        <input name="consent" required type="checkbox" value="yes" />
        <span>
          {copy.consent}
        </span>
      </label>
      <label className="human-verification">
        <input name="humanVerification" required type="checkbox" value="yes" />
        <span>
        <strong>{copy.humanTitle}</strong>
        <small>{copy.humanHelp}</small>
        </span>
        <i aria-hidden="true">✓</i>
      </label>
      <div className="participation-form-footer">
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting
            ? copy.submitting
            : copy.submit}
        </button>
        {message && <p aria-live="polite">{message}</p>}
      </div>
    </form>
  );
}

export function ParticipationForms({
  copy,
  locale,
}: {
  copy: Record<string, string>;
  locale: Locale;
}) {
  return (
    <section className="application-section" id="application-forms">
      <div className="container">
        <div className="application-heading">
          <span className="eyebrow">
            {copy.eyebrow}
          </span>
          <h2>
            {copy.title}
          </h2>
          <p>
            {copy.summary}
          </p>
        </div>

        <div className="application-grid">
          <article className="application-card">
            <header>
              <span>TR</span>
              <div>
                <small>{copy.turkeyRegion}</small>
                <h3>{copy.turkeyTitle}</h3>
              </div>
            </header>
            <ApplicationForm copy={copy} formType="turkiye" locale={locale}>
              <fieldset>
                <legend>{copy.teacherSection}</legend>
                <div className="application-fields">
                  <Field label={copy.firstName} name="teacherFirstName" />
                  <Field label={copy.lastName} name="teacherLastName" />
                  <Field label={copy.email} name="teacherEmail" type="email" />
                  <Field label={copy.phone} name="teacherPhone" type="tel" />
                </div>
              </fieldset>
              <fieldset>
                <legend>{copy.schoolSection}</legend>
                <div className="application-fields">
                  <Field label={copy.schoolName} name="schoolName" />
                  <label>
                    <span>{copy.province} *</span>
                    <select name="province" required defaultValue="">
                      <option disabled value="">{copy.provincePlaceholder}</option>
                      {turkishProvinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </label>
                  <Field label={copy.district} name="district" required={false} />
                  <Field label={copy.principal} name="principalName" />
                </div>
              </fieldset>
              <fieldset>
                <legend>{copy.studentsSection}</legend>
                <div className="application-fields">
                  <Field label={copy.studentCount} name="studentCount" type="number" />
                  <Field label={copy.ageGroup} name="ageGroup" />
                  <label className="full-field">
                    <span>{copy.englishLevel} *</span>
                    <select name="englishLevel" required defaultValue="">
                      <option disabled value="">{copy.levelPlaceholder}</option>
                      <option value="intermediate">{copy.intermediate}</option>
                      <option value="good">{copy.good}</option>
                      <option value="very-good">{copy.veryGood}</option>
                    </select>
                  </label>
                </div>
              </fieldset>
              <label className="full-field">
                <span>{copy.details}</span>
                <textarea name="details" rows={5} />
              </label>
            </ApplicationForm>
          </article>

          <article className="application-card application-card-us">
            <header>
              <span>US</span>
              <div>
                <small>{copy.usRegion}</small>
                <h3>{copy.usTitle}</h3>
              </div>
            </header>
            <ApplicationForm copy={copy} formType="us" locale={locale}>
              <fieldset>
                <legend>{copy.applicantSection}</legend>
                <div className="application-fields">
                  <Field label={copy.firstName} name="applicantFirstName" />
                  <Field label={copy.lastName} name="applicantLastName" />
                  <Field label={copy.email} name="applicantEmail" type="email" />
                  <Field label={copy.dateOfBirth} name="dateOfBirth" type="date" />
                  <label>
                    <span>{copy.state} *</span>
                    <select name="state" required defaultValue="">
                      <option disabled value="">{copy.statePlaceholder}</option>
                      {usStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </label>
                  <Field label={copy.city ?? "City"} name="city" />
                </div>
              </fieldset>
              <fieldset>
                <legend>{copy.referrerSection}</legend>
                <div className="application-fields">
                  <Field label={copy.firstName} name="referrerFirstName" />
                  <Field label={copy.lastName} name="referrerLastName" />
                  <Field label={copy.email} name="referrerEmail" type="email" />
                </div>
              </fieldset>
              <fieldset>
                <legend>{copy.parentSection}</legend>
                <div className="application-fields">
                  <Field label={copy.firstName} name="parentFirstName" />
                  <Field label={copy.lastName} name="parentLastName" />
                  <Field label={copy.email} name="parentEmail" type="email" />
                  <Field label={copy.phone} name="parentPhone" type="tel" />
                </div>
              </fieldset>
              <label className="full-field">
                <span>{copy.details}</span>
                <textarea name="details" rows={5} />
              </label>
            </ApplicationForm>
          </article>
        </div>
      </div>
    </section>
  );
}
