"use client";

import { FormEvent, useState } from "react";
import type { ContentPage } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

const pageNames: Record<string, string> = {
  home: "Ana Sayfa · TR",
  "bizim-hikayemiz": "Bizim Hikâyemiz · TR",
  "nasil-calisiyoruz": "Nasıl Çalışıyoruz · TR",
  "projeye-katilim": "Projeye Katılım · TR",
  "home-en": "Home · EN",
  "bizim-hikayemiz-en": "Our Story · EN",
  "nasil-calisiyoruz-en": "How It Works · EN",
  "projeye-katilim-en": "Join the Project · EN",
};

export function ContentEditor({
  locale,
  pages,
}: {
  locale: Locale;
  pages: ContentPage[];
}) {
  const [selectedSlug, setSelectedSlug] = useState(pages[0]?.slug ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = pages.find((page) => page.slug === selectedSlug);
  if (!selected) return null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/pages/${selectedSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eyebrow: form.get("eyebrow"),
        title: form.get("title"),
        summary: form.get("summary"),
        body: form.get("body"),
      }),
    });
    const result = (await response.json()) as { message?: string; error?: string };
    setBusy(false);
    setMessage(
      result.message ??
        result.error ??
        (locale === "tr" ? "İşlem tamamlanamadı." : "The operation failed."),
    );
  }

  return (
    <div className="editor-shell">
      <div className="editor-tabs">
        {pages.map((page) => (
          <button
            className={page.slug === selectedSlug ? "active" : ""}
            key={page.slug}
            onClick={() => {
              setSelectedSlug(page.slug);
              setMessage("");
            }}
            type="button"
          >
            {pageNames[page.slug] ?? page.title}
          </button>
        ))}
      </div>
      <form className="editor-form" key={selectedSlug} onSubmit={save}>
        <div className="field-row">
          <div>
            <label htmlFor="eyebrow">
              {locale === "tr" ? "Üst başlık" : "Eyebrow"}
            </label>
            <input
              defaultValue={selected.eyebrow}
              id="eyebrow"
              name="eyebrow"
              required
            />
          </div>
          <div>
            <label htmlFor="title">
              {locale === "tr" ? "Sayfa başlığı" : "Page title"}
            </label>
            <input
              defaultValue={selected.title}
              id="title"
              name="title"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="summary">
            {locale === "tr" ? "Kısa açıklama" : "Short description"}
          </label>
          <textarea
            defaultValue={selected.summary}
            id="summary"
            name="summary"
            required
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="body">
            {locale === "tr" ? "Sayfa içeriği" : "Page content"}
          </label>
          <textarea
            defaultValue={selected.body}
            id="body"
            name="body"
            required
            rows={10}
          />
          <small>
            {locale === "tr"
              ? "Paragraflar arasında boş bir satır bırakın."
              : "Leave a blank line between paragraphs."}
          </small>
        </div>
        <div className="editor-footer">
          <span className="form-success" role="status">{message}</span>
          <button className="button button-primary" disabled={busy} type="submit">
            {busy
              ? locale === "tr" ? "Kaydediliyor..." : "Saving..."
              : locale === "tr" ? "Değişiklikleri kaydet" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
