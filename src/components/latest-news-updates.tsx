"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  formatNewsDate,
  localizedNewsBody,
  localizedNewsTitle,
  newsDisplayTitle,
  newsTypeLabels,
} from "@/lib/news";
import type { NewsItem } from "@/lib/types";

export function LatestNewsUpdates({
  items,
  locale,
}: {
  items: NewsItem[];
  locale: Locale;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  const item = items[activeIndex] ?? items[0] ?? null;
  const title = item ? localizedNewsTitle(item, locale) : "";

  return (
    <section className="section latest-updates">
      <div className="container latest-updates-heading">
        <div>
          <span className="eyebrow">
            {locale === "tr" ? "SON GELİŞMELER" : "LATEST ACTIVITY"}
          </span>
          <h2>
            {locale === "tr"
              ? "En son kısa güncellemeler."
              : "Our latest short updates."}
          </h2>
        </div>
        <Link className="text-link" href="/haberler-ve-guncellemeler">
          {locale === "tr" ? "Tümünü görüntüle" : "View all"} →
        </Link>
      </div>
      <div
        className="container latest-update-stage"
        onBlur={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {item ? (
          <article className={`latest-update-card type-${item.contentType}`}>
            <div className="latest-update-meta">
              <span>{newsTypeLabels[item.contentType][locale]}</span>
              {item.category && <span>{item.category}</span>}
              {item.publishedAt && (
                <time dateTime={item.publishedAt}>
                  {formatNewsDate(item.publishedAt, locale)}
                </time>
              )}
            </div>
            {title && <h3>{title}</h3>}
            <p className={title ? "" : "latest-update-primary"}>
              {localizedNewsBody(item, locale)}
            </p>
            <Link href={`/haberler-ve-guncellemeler/${item.id}`}>
              {locale === "tr" ? "Devamını aç" : "Open update"} →
            </Link>
          </article>
        ) : (
          <article className="latest-update-card latest-update-placeholder type-update">
            <div className="latest-update-meta">
              <span>{locale === "tr" ? "Güncelleme" : "Update"}</span>
            </div>
            <h3>
              {locale === "tr"
                ? "Yeni güncellemeler yakında burada."
                : "New updates will appear here soon."}
            </h3>
            <p>
              {locale === "tr"
                ? "Projemizdeki son gelişmeleri ve kısa duyuruları bu alandan takip edebilirsiniz."
                : "Follow the latest project developments and short announcements in this section."}
            </p>
          </article>
        )}
        {items.length > 1 && (
          <div className="latest-update-controls">
            <button
              aria-label={locale === "tr" ? "Önceki içerik" : "Previous item"}
              onClick={() =>
                setActiveIndex(
                  (current) => (current - 1 + items.length) % items.length,
                )
              }
              type="button"
            >
              ←
            </button>
            <div
              aria-label={locale === "tr" ? "İçerik seçimi" : "Select item"}
              role="group"
            >
              {items.map((candidate, index) => (
                <button
                  aria-label={`${index + 1}: ${newsDisplayTitle(candidate, locale)}`}
                  aria-pressed={index === activeIndex}
                  className={index === activeIndex ? "active" : ""}
                  key={candidate.id}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                />
              ))}
            </div>
            <button
              aria-label={locale === "tr" ? "Sonraki içerik" : "Next item"}
              onClick={() =>
                setActiveIndex((current) => (current + 1) % items.length)
              }
              type="button"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
