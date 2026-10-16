import type { Locale } from "@/lib/i18n";
import type { NewsContentType, NewsItem } from "@/lib/types";

export const newsTypeLabels: Record<NewsContentType, Record<Locale, string>> = {
  update: { tr: "Güncelleme", en: "Update" },
  news: { tr: "Haber", en: "News" },
  video: { tr: "Video", en: "Video" },
  blog: { tr: "Blog", en: "Blog" },
};

export function localizedNewsTitle(item: NewsItem, locale: Locale): string {
  return (locale === "tr" ? item.titleTr : item.titleEn).trim();
}

export function localizedNewsBody(item: NewsItem, locale: Locale): string {
  return locale === "tr" ? item.abstractTr : item.abstractEn;
}

export function newsDisplayTitle(item: NewsItem, locale: Locale): string {
  return localizedNewsTitle(item, locale) || newsTypeLabels[item.contentType][locale];
}

export function formatNewsDate(value: string, locale: Locale): string {
  if (!value) return "";
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "long",
    timeZone: "UTC",
  };
  if (!value.endsWith("T00:00")) options.timeStyle = "short";
  return new Intl.DateTimeFormat(
    locale === "tr" ? "tr-TR" : "en-US",
    options,
  ).format(new Date(`${value}:00Z`));
}

export function youtubeId(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.slice(1) || null;
    if (
      url.hostname === "youtube.com" ||
      url.hostname.endsWith(".youtube.com")
    ) {
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2] || null;
      }
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}
