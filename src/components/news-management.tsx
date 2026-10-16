"use client";

import { FormEvent, useEffect, useState } from "react";
import { TrashIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import { formatNewsDate } from "@/lib/news";
import type { NewsInput, NewsItem } from "@/lib/types";

const emptyNews: NewsInput = {
  contentType: "update",
  titleTr: "",
  titleEn: "",
  abstractTr: "",
  abstractEn: "",
  category: "",
  sourceName: "",
  articleUrl: "",
  imageUrl: "",
  videoUrl: "",
  publishedAt: "",
  isPublished: true,
  isFeatured: false,
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
  const [draftType, setDraftType] = useState(selected.contentType);
  const [trLength, setTrLength] = useState(selected.abstractTr.length);
  const [enLength, setEnLength] = useState(selected.abstractEn.length);
  const updateLimit = draftType === "update" ? 500 : 3000;

  useEffect(() => {
    setDraftType(selected.contentType);
    setTrLength(selected.abstractTr.length);
    setEnLength(selected.abstractEn.length);
  }, [selected]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload: NewsInput = {
      contentType: String(
        form.get("contentType") ?? "news",
      ) as NewsInput["contentType"],
      titleTr: String(form.get("titleTr") ?? ""),
      titleEn: String(form.get("titleEn") ?? ""),
      abstractTr: String(form.get("abstractTr") ?? ""),
      abstractEn: String(form.get("abstractEn") ?? ""),
      category: String(form.get("category") ?? ""),
      sourceName: String(form.get("sourceName") ?? ""),
      articleUrl: String(form.get("articleUrl") ?? ""),
      imageUrl: String(form.get("imageUrl") ?? ""),
      videoUrl: String(form.get("videoUrl") ?? ""),
      publishedAt: String(form.get("publishedAt") ?? ""),
      isPublished: form.get("isPublished") === "on",
      isFeatured: form.get("isFeatured") === "on",
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
        locale === "tr" ? "Bu içerik silinsin mi?" : "Delete this content item?",
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
          <span>{locale === "tr" ? "HABERLER VE GÜNCELLEMELER" : "NEWS & UPDATES"}</span>
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
          + {locale === "tr" ? "Yeni içerik ekle" : "Add content"}
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
            <strong>
              {(locale === "tr" ? item.titleTr : item.titleEn) ||
                (locale === "tr" ? item.abstractTr : item.abstractEn).slice(0, 70)}
            </strong>
            <small>
              {item.contentType.toUpperCase()} ·{" "}
              {item.publishedAt
                ? formatNewsDate(item.publishedAt, locale)
                : locale === "tr"
                  ? "Tarih belirtilmedi"
                  : "No date"}
              {item.isFeatured &&
                ` · ${locale === "tr" ? "Öne çıkan" : "Featured"}`}
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
                ? locale === "tr" ? "YENİ İÇERİK" : "NEW CONTENT"
                : locale === "tr" ? "İÇERİK KAYDI" : "CONTENT ITEM"}
            </span>
            <h2>
              {selectedId === "new"
                ? locale === "tr" ? "Haber veya güncelleme ekle" : "Add news or update"
                : (locale === "tr" ? selected.titleTr : selected.titleEn) ||
                  (locale === "tr" ? selected.abstractTr : selected.abstractEn).slice(0, 80)}
            </h2>
          </div>
          {selectedId !== "new" && (
            <button
              aria-label={locale === "tr" ? "İçeriği sil" : "Delete content"}
              className="icon-danger-button"
              disabled={busy}
              onClick={() => void remove()}
              type="button"
            >
              <TrashIcon />
            </button>
          )}
        </div>
        <div className="news-type-grid">
          <label>
            <span>{locale === "tr" ? "İçerik türü" : "Content type"}</span>
            <select
              defaultValue={selected.contentType}
              name="contentType"
              onChange={(event) =>
                setDraftType(event.target.value as NewsInput["contentType"])
              }
            >
              <option value="update">
                {locale === "tr" ? "Kısa güncelleme" : "Short update"}
              </option>
              <option value="news">{locale === "tr" ? "Haber" : "News"}</option>
              <option value="video">Video</option>
              <option value="blog">Blog</option>
            </select>
          </label>
          <label>
            <span>{locale === "tr" ? "Kategori / etiket" : "Category / hashtag"}</span>
            <input
              defaultValue={selected.category}
              maxLength={100}
              name="category"
              placeholder={locale === "tr" ? "Etkinlik, #Gençlik..." : "Event, #Youth..."}
            />
          </label>
        </div>
        <div className="news-language-grid">
          <fieldset>
            <legend>Türkçe</legend>
            <label>
              <span>Başlık</span>
              <input
                defaultValue={selected.titleTr}
                name="titleTr"
                required={draftType !== "update"}
              />
              {draftType === "update" && <small>Kısa güncellemelerde isteğe bağlıdır.</small>}
            </label>
            <label>
              <span>{draftType === "update" ? "Güncelleme metni" : "Kısa özet"}</span>
              <textarea
                defaultValue={selected.abstractTr}
                maxLength={updateLimit}
                name="abstractTr"
                onInput={(event) => setTrLength(event.currentTarget.value.length)}
                required
                rows={5}
              />
              <small>{trLength} / {updateLimit}</small>
            </label>
          </fieldset>
          <fieldset>
            <legend>English</legend>
            <label>
              <span>Title</span>
              <input
                defaultValue={selected.titleEn}
                name="titleEn"
                required={draftType !== "update"}
              />
              {draftType === "update" && <small>Optional for short updates.</small>}
            </label>
            <label>
              <span>{draftType === "update" ? "Update text" : "Short abstract"}</span>
              <textarea
                defaultValue={selected.abstractEn}
                maxLength={updateLimit}
                name="abstractEn"
                onInput={(event) => setEnLength(event.currentTarget.value.length)}
                required
                rows={5}
              />
              <small>{enLength} / {updateLimit}</small>
            </label>
          </fieldset>
        </div>
        <div className="news-media-grid">
          <label>
            <span>{locale === "tr" ? "Kaynak / yayın adı" : "Source / publication"}</span>
            <input defaultValue={selected.sourceName} name="sourceName" />
          </label>
          <label>
            <span>{locale === "tr" ? "Yayın tarihi ve saati" : "Publication date and time"}</span>
            <input
              defaultValue={selected.publishedAt}
              name="publishedAt"
              type="datetime-local"
            />
          </label>
          <label>
            <span>
              {locale === "tr"
                ? "Haber / blog / dış bağlantı"
                : "News / blog / external link"}
            </span>
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
                ? "Bu içeriği yayımla"
                : "Publish this content"}
            </span>
          </label>
          <label className="news-publish-field">
            <input
              defaultChecked={selected.isFeatured}
              name="isFeatured"
              type="checkbox"
            />
            <span>
              {locale === "tr"
                ? "Ana sayfada öne çıkar"
                : "Feature on the homepage"}
            </span>
          </label>
        </div>
        <div className="editor-footer">
          <span className="form-success" role="status">{message}</span>
          <button className="button button-primary" disabled={busy} type="submit">
            {busy
              ? locale === "tr" ? "Kaydediliyor..." : "Saving..."
              : locale === "tr" ? "İçeriği kaydet" : "Save content"}
          </button>
        </div>
      </form>
    </div>
  );
}
