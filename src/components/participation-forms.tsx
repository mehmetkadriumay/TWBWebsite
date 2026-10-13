"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

declare global {
  interface Window {
    grecaptcha?: {
      render?: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => number;
      reset?: (widgetId?: number) => void;
    };
  }
}

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
  recaptchaReady,
  recaptchaSiteKey,
}: {
  children: React.ReactNode;
  copy: Record<string, string>;
  formType: FormType;
  locale: Locale;
  recaptchaReady: boolean;
  recaptchaSiteKey: string;
}) {
  const [message, setMessage] = useState("");
  const [documentLinks, setDocumentLinks] = useState<{
    documentUrl: string;
    printUrl: string;
  } | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const recaptchaElement = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  useEffect(() => {
    if (
      !recaptchaReady ||
      !recaptchaSiteKey ||
      !recaptchaElement.current ||
      !window.grecaptcha ||
      typeof window.grecaptcha.render !== "function" ||
      recaptchaWidgetId.current !== null
    ) {
      return;
    }
    recaptchaWidgetId.current = window.grecaptcha.render(
      recaptchaElement.current,
      {
        sitekey: recaptchaSiteKey,
        callback: setRecaptchaToken,
        "expired-callback": () => setRecaptchaToken(""),
        "error-callback": () => {
          setRecaptchaToken("");
          setMessage(
            locale === "tr"
              ? "Google reCAPTCHA yüklenemedi. Lütfen sayfayı yenileyin."
              : "Google reCAPTCHA could not load. Please refresh the page.",
          );
        },
      },
    );
  }, [locale, recaptchaReady, recaptchaSiteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recaptchaToken) {
      setMessage(
        locale === "tr"
          ? "Lütfen Google reCAPTCHA doğrulamasını tamamlayın."
          : "Please complete the Google reCAPTCHA verification.",
      );
      return;
    }
    const printWindow =
      formType === "turkiye"
        ? window.open("", "twb-turkiye-application-print")
        : null;
    if (printWindow) {
      printWindow.document.write(
        `<p style="font:16px Arial;padding:24px">${
          locale === "tr"
            ? "Başvurunuz kaydediliyor..."
            : "Your application is being saved..."
        }</p>`,
      );
      printWindow.document.close();
    }
    setSubmitting(true);
    setMessage("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType,
          locale,
          fields: values,
          recaptchaToken,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        error?: string;
        documentUrl?: string | null;
        printUrl?: string | null;
      };
      setMessage(result.message ?? result.error ?? "");
      if (response.ok) {
        if (result.documentUrl && result.printUrl) {
          setDocumentLinks({
            documentUrl: result.documentUrl,
            printUrl: result.printUrl,
          });
          const download = document.createElement("a");
          download.href = result.documentUrl;
          download.download = "";
          document.body.appendChild(download);
          download.click();
          download.remove();
          if (printWindow) {
            printWindow.location.href = result.printUrl;
          }
        } else {
          printWindow?.close();
        }
        form.reset();
        setSubmitted(true);
        return;
      }
    } catch {
      setMessage(
        locale === "tr"
          ? "Başvuru gönderilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin."
          : "The application could not be submitted. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
    printWindow?.close();
    setRecaptchaToken("");
    if (recaptchaWidgetId.current !== null) {
      window.grecaptcha?.reset?.(recaptchaWidgetId.current);
    }
  }

  if (submitted) {
    return (
      <div className="application-success" role="status">
        <span aria-hidden="true">✓</span>
        <h4>{copy.thankYou}</h4>
        <p>{message}</p>
        {documentLinks && (
          <div className="application-document-actions">
            <a
              className="button button-secondary"
              href={documentLinks.documentUrl}
            >
              {locale === "tr" ? "Word belgesini indir" : "Download Word document"}
            </a>
            <button
              className="button button-primary"
              onClick={() =>
                window.open(
                  documentLinks.printUrl,
                  "twb-turkiye-application-print",
                )
              }
              type="button"
            >
              {locale === "tr" ? "Yazdır" : "Print"}
            </button>
          </div>
        )}
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
      <div className="recaptcha-field">
        {recaptchaSiteKey ? (
          <div ref={recaptchaElement} />
        ) : (
          <p role="alert">
            {locale === "tr"
              ? "Google reCAPTCHA site anahtarı yapılandırılmamış."
              : "The Google reCAPTCHA site key is not configured."}
          </p>
        )}
      </div>
      <div className="participation-form-footer">
        <button
          className="button button-primary"
          disabled={submitting || !recaptchaSiteKey}
          type="submit"
        >
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
  recaptchaSiteKey,
}: {
  copy: Record<string, string>;
  locale: Locale;
  recaptchaSiteKey: string;
}) {
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaScriptLoaded, setRecaptchaScriptLoaded] = useState(false);

  useEffect(() => {
    if (!recaptchaScriptLoaded || !recaptchaSiteKey) return;
    let attempts = 0;
    const checkApi = window.setInterval(() => {
      attempts += 1;
      if (typeof window.grecaptcha?.render === "function") {
        window.clearInterval(checkApi);
        setRecaptchaReady(true);
      } else if (attempts >= 100) {
        window.clearInterval(checkApi);
      }
    }, 100);
    return () => window.clearInterval(checkApi);
  }, [recaptchaScriptLoaded, recaptchaSiteKey]);

  return (
    <section className="application-section" id="application-forms">
      {recaptchaSiteKey && (
        <Script
          onReady={() => setRecaptchaScriptLoaded(true)}
          src={`https://www.google.com/recaptcha/api.js?render=explicit&hl=${locale}`}
          strategy="afterInteractive"
        />
      )}
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
            <ApplicationForm
              copy={copy}
              formType="turkiye"
              locale={locale}
              recaptchaReady={recaptchaReady}
              recaptchaSiteKey={recaptchaSiteKey}
            >
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
            <ApplicationForm
              copy={copy}
              formType="us"
              locale={locale}
              recaptchaReady={recaptchaReady}
              recaptchaSiteKey={recaptchaSiteKey}
            >
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
