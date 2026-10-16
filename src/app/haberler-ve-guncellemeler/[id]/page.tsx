import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import {
  formatNewsDate,
  localizedNewsBody,
  newsDisplayTitle,
  newsTypeLabels,
  youtubeId,
} from "@/lib/news";

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = parseId((await params).id);
  const [locale, item] = await Promise.all([
    getLocale(),
    id ? getNewsById(id) : Promise.resolve(null),
  ]);
  if (!item) return {};
  return {
    title: newsDisplayTitle(item, locale),
    description: localizedNewsBody(item, locale).slice(0, 160),
  };
}

export default async function NewsUpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  const [locale, item] = await Promise.all([
    getLocale(),
    id ? getNewsById(id) : Promise.resolve(null),
  ]);
  if (!item) notFound();
  const title = newsDisplayTitle(item, locale);
  const body = localizedNewsBody(item, locale);
  const videoId = youtubeId(item.videoUrl);

  return (
    <article className="section news-detail">
      <div className="container news-detail-container">
        <Link className="back-to-grid" href="/haberler-ve-guncellemeler">
          ← {locale === "tr" ? "Haberler ve Güncellemeler" : "News & Updates"}
        </Link>
        <div className="news-detail-meta">
          <span>{newsTypeLabels[item.contentType][locale]}</span>
          {item.category && <span>{item.category}</span>}
          {item.publishedAt && (
            <time dateTime={item.publishedAt}>
              {formatNewsDate(item.publishedAt, locale)}
            </time>
          )}
        </div>
        <h1>{title}</h1>
        {item.sourceName && <p className="news-detail-source">{item.sourceName}</p>}
        {videoId ? (
          <div className="news-detail-media video-frame">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
              title={title}
            />
          </div>
        ) : item.imageUrl ? (
          <div className="news-detail-media">
            <img alt="" src={item.imageUrl} />
          </div>
        ) : null}
        <div className="news-detail-body">
          {body.split(/\n\n+/).map((paragraph, index) => (
            <p key={`${paragraph.slice(0, 30)}-${index}`}>{paragraph}</p>
          ))}
        </div>
        <div className="news-detail-actions">
          {item.articleUrl && (
            <a
              className="button button-primary"
              href={item.articleUrl}
              rel="noreferrer"
              target="_blank"
            >
              {item.contentType === "blog"
                ? locale === "tr"
                  ? "Blog yazısını aç"
                  : "Open blog post"
                : locale === "tr"
                  ? "Kaynağı aç"
                  : "Open source"}{" "}
              ↗
            </a>
          )}
          {item.videoUrl && !videoId && (
            <a
              className="button button-secondary"
              href={item.videoUrl}
              rel="noreferrer"
              target="_blank"
            >
              {locale === "tr" ? "Videoyu aç" : "Open video"} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
