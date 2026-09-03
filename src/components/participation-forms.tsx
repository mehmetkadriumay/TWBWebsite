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
  formType,
  locale,
}: {
  children: React.ReactNode;
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
        <h4>{locale === "tr" ? "Teşekkür ederiz!" : "Thank you!"}</h4>
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
          {locale === "tr"
            ? "Verdiğim bilgilerin proje başvurusunun değerlendirilmesi amacıyla kullanılmasını kabul ediyorum."
            : "I agree that the information provided may be used to evaluate this project application."}
        </span>
      </label>
      <label className="human-verification">
        <input name="humanVerification" required type="checkbox" value="yes" />
        <span>
        <strong>{locale === "tr" ? "Ben insanım" : "I am human"}</strong>
        <small>
          {locale === "tr"
            ? "Başvuruyu göndermeden önce bu kutuyu işaretleyin."
            : "Check this box before submitting your application."}
        </small>
        </span>
        <i aria-hidden="true">✓</i>
      </label>
      <div className="participation-form-footer">
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting
            ? locale === "tr" ? "Gönderiliyor..." : "Submitting..."
            : locale === "tr" ? "Başvuruyu Gönder" : "Submit Application"}
        </button>
        {message && <p aria-live="polite">{message}</p>}
      </div>
    </form>
  );
}

export function ParticipationForms({ locale }: { locale: Locale }) {
  const tr = locale === "tr";

  return (
    <section className="application-section" id="application-forms">
      <div className="container">
        <div className="application-heading">
          <span className="eyebrow">
            {tr ? "BAŞVURU FORMLARI" : "APPLICATION FORMS"}
          </span>
          <h2>
            {tr
              ? "Size uygun başvuru formunu doldurun."
              : "Complete the application form that applies to you."}
          </h2>
          <p>
            {tr
              ? "Türkiye başvurusu öğretmen ve okul grubu bilgilerini; Amerika başvurusu öğrenci, referans veren kişi ve veli bilgilerini toplar."
              : "The Türkiye form collects teacher and school-group details; the U.S. form collects applicant, referrer, and parent information."}
          </p>
        </div>

        <div className="application-grid">
          <article className="application-card">
            <header>
              <span>TR</span>
              <div>
                <small>{tr ? "TÜRKİYE" : "TÜRKİYE"}</small>
                <h3>{tr ? "Türkiye'den Proje Başvurusu" : "Project Application from Türkiye"}</h3>
              </div>
            </header>
            <ApplicationForm formType="turkiye" locale={locale}>
              <fieldset>
                <legend>{tr ? "Başvuruyu yapan öğretmen" : "Applying teacher"}</legend>
                <div className="application-fields">
                  <Field label={tr ? "Adı" : "First name"} name="teacherFirstName" />
                  <Field label={tr ? "Soyadı" : "Last name"} name="teacherLastName" />
                  <Field label={tr ? "E-posta adresi" : "Email address"} name="teacherEmail" type="email" />
                  <Field label={tr ? "Telefon numarası" : "Phone number"} name="teacherPhone" type="tel" />
                </div>
              </fieldset>
              <fieldset>
                <legend>{tr ? "Okul bilgileri" : "School information"}</legend>
                <div className="application-fields">
                  <Field label={tr ? "Çalıştığı okulun adı" : "School name"} name="schoolName" />
                  <label>
                    <span>{tr ? "Okulun bulunduğu il" : "Province"} *</span>
                    <select name="province" required defaultValue="">
                      <option disabled value="">{tr ? "İl seçin" : "Select a province"}</option>
                      {turkishProvinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </label>
                  <Field label={tr ? "İlçe" : "District"} name="district" required={false} />
                  <Field label={tr ? "Okul müdürünün adı soyadı" : "Principal's full name"} name="principalName" />
                </div>
              </fieldset>
              <fieldset>
                <legend>{tr ? "Projeye katılacak öğrenciler" : "Participating students"}</legend>
                <div className="application-fields">
                  <Field label={tr ? "Öğrenci sayısı" : "Number of students"} name="studentCount" type="number" />
                  <Field label={tr ? "Yaş grubu" : "Age group"} name="ageGroup" />
                  <label className="full-field">
                    <span>{tr ? "İngilizce seviyeleri" : "English proficiency"} *</span>
                    <select name="englishLevel" required defaultValue="">
                      <option disabled value="">{tr ? "Seviye seçin" : "Select a level"}</option>
                      <option value="intermediate">{tr ? "Orta" : "Intermediate"}</option>
                      <option value="good">{tr ? "İyi" : "Good"}</option>
                      <option value="very-good">{tr ? "Çok iyi" : "Very good"}</option>
                    </select>
                  </label>
                </div>
              </fieldset>
              <label className="full-field">
                <span>{tr ? "Paylaşmak istediğiniz detay bilgiler" : "Additional details"}</span>
                <textarea name="details" rows={5} />
              </label>
            </ApplicationForm>
          </article>

          <article className="application-card application-card-us">
            <header>
              <span>US</span>
              <div>
                <small>{tr ? "AMERİKA BİRLEŞİK DEVLETLERİ" : "UNITED STATES"}</small>
                <h3>{tr ? "Amerika'dan Proje Başvurusu" : "Project Application from the U.S."}</h3>
              </div>
            </header>
            <ApplicationForm formType="us" locale={locale}>
              <fieldset>
                <legend>{tr ? "Başvuru sahibi öğrenci" : "Applicant"}</legend>
                <div className="application-fields">
                  <Field label={tr ? "Adı" : "First name"} name="applicantFirstName" />
                  <Field label={tr ? "Soyadı" : "Last name"} name="applicantLastName" />
                  <Field label={tr ? "E-posta adresi" : "Email address"} name="applicantEmail" type="email" />
                  <Field label={tr ? "Doğum tarihi" : "Date of birth"} name="dateOfBirth" type="date" />
                  <label>
                    <span>{tr ? "Eyalet" : "State"} *</span>
                    <select name="state" required defaultValue="">
                      <option disabled value="">{tr ? "Eyalet seçin" : "Select a state"}</option>
                      {usStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </label>
                  <Field label={tr ? "Şehir" : "City"} name="city" />
                </div>
              </fieldset>
              <fieldset>
                <legend>{tr ? "Referans veren kişi" : "Referring person"}</legend>
                <div className="application-fields">
                  <Field label={tr ? "Adı" : "First name"} name="referrerFirstName" />
                  <Field label={tr ? "Soyadı" : "Last name"} name="referrerLastName" />
                  <Field label={tr ? "E-posta adresi" : "Email address"} name="referrerEmail" type="email" />
                </div>
              </fieldset>
              <fieldset>
                <legend>{tr ? "Veli bilgileri" : "Parent or guardian"}</legend>
                <div className="application-fields">
                  <Field label={tr ? "Adı" : "First name"} name="parentFirstName" />
                  <Field label={tr ? "Soyadı" : "Last name"} name="parentLastName" />
                  <Field label={tr ? "E-posta adresi" : "Email address"} name="parentEmail" type="email" />
                  <Field label={tr ? "Telefon numarası" : "Phone number"} name="parentPhone" type="tel" />
                </div>
              </fieldset>
              <label className="full-field">
                <span>{tr ? "Paylaşmak istediğiniz detay bilgiler" : "Additional details"}</span>
                <textarea name="details" rows={5} />
              </label>
            </ApplicationForm>
          </article>
        </div>
      </div>
    </section>
  );
}
