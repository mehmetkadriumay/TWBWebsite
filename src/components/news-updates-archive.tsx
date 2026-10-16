"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  formatNewsDate,
  localizedNewsBody,
  localizedNewsTitle,
  newsTypeLabels,
} from "@/lib/news";
import type { NewsContentType, NewsItem } from "@/lib/types";

type Filter = "all" | NewsContentType;

export function NewsUpdatesArchive({
  items,
  locale,
}: {
  items: NewsItem[];
  locale: Locale;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);
  const filters: Filter[] = ["all", "update", "news", "video", "blog"];
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(
      locale === "tr" ? "tr-TR" : "en-US",
    );
    return items.filter((item) => {
      if (filter !== "all" && item.contentType !== filter) return false;
      if (!normalizedQuery) return true;
      return [
        localizedNewsTitle(item, locale),
        localizedNewsBody(item, locale),
        item.sourceName,
        item.category,
      ]
        .join(" ")
        .toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US")
        .includes(normalizedQuery);
    });
  }, [filter, items, locale, query]);

  function selectFilter(value: Filter) {
    setFilter(value);
    setVisibleCount(9);
  }

  return (
    <div className="news-archive">
      <div className="news-archive-tools">
        <label>
          <span>{locale === "tr" ? "İçerikte ara" : "Search content"}</span>
          <input
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(9);
            }}
            placeholder={
              locale === "tr"
                ? "Başlık, metin, kaynak veya etiket..."
                : "Title, text, source, or hashtag..."
            }
            type="search"
            value={query}
          />
        </label>
        <div className="news-filter-buttons">
          {filters.map((value) => (
            <button
              aria-pressed={filter === value}
              className={filter === value ? "active" : ""}
              key={value}
              onClick={() => selectFilter(value)}
              type="button"
            >
              {value === "all"
                ? locale === "tr"
                  ? "Tümü"
                  : "All"
                : newsTypeLabels[value][locale]}
            </button>
          ))}
        </div>
      </div>
      {filtered.length > 0 ? (
        <>
          <div className="news-archive-grid">
            {filtered.slice(0, visibleCount).map((item) => (
              <article
                className={`news-archive-card type-${item.contentType}`}
                id={`item-${item.id}`}
                key={item.id}
              >
                {item.imageUrl && (
                  <div className="news-archive-media">
                    <img alt="" loading="lazy" src={item.imageUrl} />
                  </div>
                )}
                <div className="news-archive-card-copy">
                  <div className="news-archive-meta">
                    <span>{newsTypeLabels[item.contentType][locale]}</span>
                    {item.category && <span>{item.category}</span>}
                    {item.publishedAt && (
                      <time dateTime={item.publishedAt}>
                        {formatNewsDate(item.publishedAt, locale)}
                      </time>
                    )}
                  </div>
                  {localizedNewsTitle(item, locale) && (
                    <h2>{localizedNewsTitle(item, locale)}</h2>
                  )}
                  <p>{localizedNewsBody(item, locale)}</p>
                  <div className="news-archive-actions">
                    <Link href={`/haberler-ve-guncellemeler/${item.id}`}>
                      {locale === "tr" ? "İçeriği aç" : "Open item"} →
                    </Link>
                    {item.sourceName && <small>{item.sourceName}</small>}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {visibleCount < filtered.length && (
            <button
              className="button button-secondary news-load-more"
              onClick={() => setVisibleCount((current) => current + 9)}
              type="button"
            >
              {locale === "tr" ? "Daha fazla göster" : "Show more"}
            </button>
          )}
        </>
      ) : (
        <div className="news-archive-empty">
          <strong>{locale === "tr" ? "Sonuç bulunamadı." : "No results found."}</strong>
          <p>
            {locale === "tr"
              ? "Arama kelimesini veya içerik filtresini değiştirin."
              : "Try changing the search term or content filter."}
          </p>
        </div>
      )}
    </div>
  );
}
