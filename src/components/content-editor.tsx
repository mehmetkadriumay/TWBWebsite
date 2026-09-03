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

const pageConfiguration: Record<
  string,
  {
    route: string;
    bodyLabel: [string, string];
    guidance: [string, string];
    managed: [string, string];
    separate: [string, string];
  }
> = {
  home: {
    route: "/",
    bodyLabel: ["Ana sayfa tanıtım metni", "Homepage introduction"],
    guidance: ["Tek bir tanıtım paragrafı olarak görüntülenir.", "Displayed as one introduction paragraph."],
    managed: ["Hero başlığı, açıklaması ve ana tanıtım metni", "Hero heading, description, and main introduction"],
    separate: ["Değer kartları, öğrenci görüşleri ve çağrı metinleri site arayüzüne aittir.", "Value cards, student voices, and calls to action belong to the site interface."],
  },
  "bizim-hikayemiz": {
    route: "/bizim-hikayemiz",
    bodyLabel: ["Hikâye ve vizyon metni", "Story and vision content"],
    guidance: ["Her bölüm için boş satır bırakın. “Vizyonumuz” ile başlayan son paragraf kırmızı vizyon alanı olarak gösterilir.", "Separate sections with blank lines. A final paragraph beginning with “Our vision” becomes the highlighted vision panel."],
    managed: ["Sayfa hero alanı, proje hikâyesi ve vizyon", "Page hero, project story, and vision"],
    separate: ["Resmî proje videoları ve video bilgileri ayrı medya bölümünde yönetilir.", "Official project videos and metadata are managed in a separate media section."],
  },
  "nasil-calisiyoruz": {
    route: "/nasil-calisiyoruz",
    bodyLabel: ["Üç program modeli bölümü", "Three program-model sections"],
    guidance: ["Numaralı üç bölüm için tam olarak üç paragraf kullanın.", "Use exactly three paragraphs for the three numbered sections."],
    managed: ["Sayfa hero alanı ve üç ana çalışma modeli açıklaması", "Page hero and the three main program-model explanations"],
    separate: ["Bölüm başlıkları ve temel bileşen kartları site yapısına aittir.", "Section headings and core-element cards belong to the site structure."],
  },
  "projeye-katilim": {
    route: "/projeye-katilim",
    bodyLabel: ["Başvuru süreci genel açıklaması", "Application-process overview"],
    guidance: ["Katılım şartlarının üstünde paragraf grubu olarak görüntülenir.", "Displayed as paragraphs above the participation requirements."],
    managed: ["Sayfa hero alanı ve başvuru süreci genel açıklaması", "Page hero and application-process overview"],
    separate: ["Katılım şartları, izin belgesi ve başvuru formları özel yapılandırılmış bölümlerdir.", "Requirements, permission document, and application forms are specialized structured sections."],
  },
};

function baseSlug(slug: string) {
  return slug.endsWith("-en") ? slug.slice(0, -3) : slug;
}

export function ContentEditor({
  locale,
  pages,
}: {
  locale: Locale;
  pages: ContentPage[];
}) {
  const [currentPages, setCurrentPages] = useState(pages);
  const [selectedSlug, setSelectedSlug] = useState(pages[0]?.slug ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = currentPages.find((page) => page.slug === selectedSlug);
  if (!selected) return null;
  const configuration = pageConfiguration[baseSlug(selected.slug)];
  const languageIndex = locale === "tr" ? 0 : 1;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const updatedPage: ContentPage = {
      slug: selectedSlug,
      eyebrow: String(form.get("eyebrow") ?? "").trim(),
      title: String(form.get("title") ?? "").trim(),
      summary: String(form.get("summary") ?? "").trim(),
      body: String(form.get("body") ?? "").trim(),
    };
    const response = await fetch(`/api/admin/pages/${selectedSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPage),
    });
    const result = (await response.json()) as {
      message?: string;
      error?: string;
      page?: ContentPage;
    };
    setBusy(false);
    setMessage(
      result.message ??
        result.error ??
        (locale === "tr" ? "İşlem tamamlanamadı." : "The operation failed."),
    );
    if (response.ok) {
      const savedPage = result.page ?? updatedPage;
      setCurrentPages((current) =>
        current.map((page) =>
          page.slug === savedPage.slug ? savedPage : page,
        ),
      );
    }
  }

  return (
    <div className="editor-shell">
      <div className="editor-tabs">
        {currentPages.map((page) => (
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
        {configuration && (
          <div className="editor-page-context">
            <div>
              <span>
                {locale === "tr" ? "DÜZENLENEN CANLI SAYFA" : "LIVE PAGE BEING EDITED"}
              </span>
              <strong>{pageNames[selected.slug] ?? selected.title}</strong>
              <small>{configuration.managed[languageIndex]}</small>
            </div>
            <div>
              <small>{configuration.separate[languageIndex]}</small>
              <a href={configuration.route} rel="noreferrer" target="_blank">
                {locale === "tr" ? "Sayfayı görüntüle ↗" : "View page ↗"}
              </a>
            </div>
          </div>
        )}
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
            {configuration
              ? configuration.bodyLabel[languageIndex]
              : locale === "tr" ? "Sayfa içeriği" : "Page content"}
          </label>
          <textarea
            defaultValue={selected.body}
            id="body"
            name="body"
            required
            rows={10}
          />
          <small>
            {configuration
              ? configuration.guidance[languageIndex]
              : locale === "tr"
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
