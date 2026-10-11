"use client";

import { FormEvent, useState } from "react";
import { TrashIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import type { NewsInput, NewsItem } from "@/lib/types";

const emptyNews: NewsInput = {
  titleTr: "",
  titleEn: "",
  abstractTr: "",
  abstractEn: "",
  sourceName: "",
  articleUrl: "",
  imageUrl: "",
  videoUrl: "",
  publishedOn: "",
  isPublished: true,
};

export function NewsManagement({
  initialNews,
  locale,
}: {
  initialNews: NewsItem[];
  locale: Locale;
}) {
  const [items, setItems] = useState(initialNews);
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialNews[0]?.id ?? "new",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected =
    selectedId === "new"
      ? emptyNews
      : items.find((item) => item.id === selectedId) ?? emptyNews;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload: NewsInput = {
      titleTr: String(form.get("titleTr") ?? ""),
      titleEn: String(form.get("titleEn") ?? ""),
      abstractTr: String(form.get("abstractTr") ?? ""),
      abstractEn: String(form.get("abstractEn") ?? ""),
      sourceName: String(form.get("sourceName") ?? ""),
      articleUrl: String(form.get("articleUrl") ?? ""),
      imageUrl: String(form.get("imageUrl") ?? ""),
      videoUrl: String(form.get("videoUrl") ?? ""),
      publishedOn: String(form.get("publishedOn") ?? ""),
      isPublished: form.get("isPublished") === "on",
    };
    const creating = selectedId === "new";
    const response = await fetch(
      creating ? "/api/admin/news" : `/api/admin/news/${selectedId}`,
      {
        method: creating ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = (await response.json()) as {
      message?: string;
      error?: string;
      news?: NewsItem;
    };
    setBusy(false);
    setMessage(
      result.message ??
        result.error ??
        (locale === "tr" ? "İşlem tamamlanamadı." : "The operation failed."),
    );
    if (!response.ok || !result.news) return;
    setItems((current) =>
      creating
        ? [result.news!, ...current]
        : current.map((item) =>
            item.id === result.news!.id ? result.news! : item,
          ),
    );
    setSelectedId(result.news.id);
  }

  async function remove() {
    if (selectedId === "new") return;
    if (
      !window.confirm(
        locale === "tr" ? "Bu haber silinsin mi?" : "Delete this news item?",
      )
    ) {
      return;
    }
    setBusy(true);
    const response = await fetch(`/api/admin/news/${selectedId}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as {
      message?: string;
      error?: string;
    };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "");
    if (!response.ok) return;
    const remaining = items.filter((item) => item.id !== selectedId);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? "new");
  }

  return (
    <div className="news-manager">
      <aside className="news-manager-list">
        <div className="news-manager-count">
          <span>{locale === "tr" ? "HABERLER" : "NEWS"}</span>
          <strong>{items.length}</strong>
        </div>
        <button
          className={selectedId === "new" ? "active" : ""}
          onClick={() => {
            setSelectedId("new");
            setMessage("");
          }}
          type="button"
        >
          + {locale === "tr" ? "Yeni haber ekle" : "Add news"}
        </button>
        {items.map((item) => (
          <button
            className={selectedId === item.id ? "active" : ""}
            key={item.id}
            onClick={() => {
              setSelectedId(item.id);
              setMessage("");
            }}
            type="button"
          >
            <strong>{locale === "tr" ? item.titleTr : item.titleEn}</strong>
            <small>
              {item.publishedOn ||
                (locale === "tr" ? "Tarih belirtilmedi" : "No date")}
              {!item.isPublished &&
                ` · ${locale === "tr" ? "Taslak" : "Draft"}`}
            </small>
          </button>
        ))}
      </aside>
      <form className="news-manager-form" key={selectedId} onSubmit={save}>
        <div className="news-manager-heading">
          <div>
            <span className="eyebrow">
              {selectedId === "new"
                ? locale === "tr" ? "YENİ HABER" : "NEW ARTICLE"
                : locale === "tr" ? "HABER KAYDI" : "NEWS ITEM"}
            </span>
            <h2>
              {selectedId === "new"
                ? locale === "tr" ? "Haber ekle" : "Add news"
                : locale === "tr" ? selected.titleTr : selected.titleEn}
            </h2>
          </div>
          {selectedId !== "new" && (
            <button
              aria-label={locale === "tr" ? "Haberi sil" : "Delete news"}
              className="icon-danger-button"
              disabled={busy}
              onClick={() => void remove()}
              type="button"
            >
              <TrashIcon />
            </button>
          )}
        </div>
        <div className="news-language-grid">
          <fieldset>
            <legend>Türkçe</legend>
            <label>
              <span>Başlık</span>
              <input defaultValue={selected.titleTr} name="titleTr" required />
            </label>
            <label>
              <span>Kısa özet</span>
              <textarea
                defaultValue={selected.abstractTr}
                name="abstractTr"
                required
                rows={5}
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>English</legend>
            <label>
              <span>Title</span>
              <input defaultValue={selected.titleEn} name="titleEn" required />
            </label>
            <label>
              <span>Short abstract</span>
              <textarea
                defaultValue={selected.abstractEn}
                name="abstractEn"
                required
                rows={5}
              />
            </label>
          </fieldset>
        </div>
        <div className="news-media-grid">
          <label>
            <span>{locale === "tr" ? "Kaynak / yayın adı" : "Source / publication"}</span>
            <input defaultValue={selected.sourceName} name="sourceName" />
          </label>
          <label>
            <span>{locale === "tr" ? "Yayın tarihi" : "Publication date"}</span>
            <input
              defaultValue={selected.publishedOn}
              name="publishedOn"
              type="date"
            />
          </label>
          <label>
            <span>{locale === "tr" ? "Haber bağlantısı" : "Article link"}</span>
            <input defaultValue={selected.articleUrl} name="articleUrl" type="url" />
          </label>
          <label>
            <span>{locale === "tr" ? "Görsel bağlantısı" : "Image link"}</span>
            <input defaultValue={selected.imageUrl} name="imageUrl" type="url" />
          </label>
          <label className="news-video-field">
            <span>{locale === "tr" ? "Video bağlantısı" : "Video link"}</span>
            <input defaultValue={selected.videoUrl} name="videoUrl" type="url" />
            <small>
              {locale === "tr"
                ? "YouTube bağlantıları sayfada gömülü video olarak gösterilir."
                : "YouTube links are embedded directly on the page."}
            </small>
          </label>
          <label className="news-publish-field">
            <input
              defaultChecked={selected.isPublished}
              name="isPublished"
              type="checkbox"
            />
            <span>
              {locale === "tr"
                ? "Haberi Our Story sayfasında yayımla"
                : "Publish on the Our Story page"}
            </span>
          </label>
        </div>
        <div className="editor-footer">
          <span className="form-success" role="status">{message}</span>
          <button className="button button-primary" disabled={busy} type="submit">
            {busy
              ? locale === "tr" ? "Kaydediliyor..." : "Saving..."
              : locale === "tr" ? "Haberi kaydet" : "Save news"}
          </button>
        </div>
      </form>
    </div>
  );
}
