import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { InstagramIcon } from "@/components/icons";
import { getNews, getPage } from "@/lib/db";
import { getLocale, localizedSlug } from "@/lib/i18n";
import { formatNewsDate, youtubeId } from "@/lib/news";
import { managedSection, storySections } from "@/lib/site-sections";

export const metadata: Metadata = { title: "Bizim Hikâyemiz" };

export default async function StoryPage() {
  const locale = await getLocale();
  const [page, news] = await Promise.all([
    getPage(localizedSlug("bizim-hikayemiz", locale)),
    getNews(),
  ]);
  if (!page) return null;
  const copy = managedSection(page.sections, "story", storySections(locale));
  const pressNews = news.filter((item) => item.contentType === "news");

  return (
    <>
      <ContentPage highlightVision slug="bizim-hikayemiz" />
      <section className="section project-videos">
        <div className="container project-videos-heading">
          <div>
            <span className="eyebrow">{copy.videosEyebrow}</span>
            <h2>{copy.videosTitle}</h2>
          </div>
          <p>{copy.videosSummary}</p>
        </div>
        <div className="container project-video-grid">
          {copy.videos.map((video) => (
            <article className="project-video-card" key={video.id}>
              <div className="video-frame">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
                  title={video.title}
                />
              </div>
              <div className="project-video-copy">
                <div className="video-meta">
                  <span>{copy.durationLabel}: {video.duration}</span>
                  <span>{copy.publisherLabel}: {video.publisher}</span>
                </div>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <a
                  href={`https://youtu.be/${video.id}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {copy.watchLabel} ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section conversation-samples">
        <div className="container conversation-samples-heading">
          <div>
            <span className="eyebrow">{copy.samplesEyebrow}</span>
            <h2>{copy.samplesTitle}</h2>
          </div>
          <p>{copy.samplesSummary}</p>
        </div>
        <div className="container conversation-sample-grid">
          {copy.samples.map((sample) => (
            <article className="conversation-sample-card" key={sample.src}>
              <video controls playsInline preload="metadata">
                <source src={sample.src} type="video/mp4" />
              </video>
              <div>
                <h3>{sample.title}</h3>
                <p>{sample.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="container conversation-consent-notice">
          <strong>{copy.samplesDisclaimerTitle}</strong>
          <p>{copy.samplesDisclaimer}</p>
        </div>
      </section>
      <section className="section story-news">
        <div className="container story-news-heading">
          <div>
            <span className="eyebrow">{copy.newsEyebrow}</span>
            <h2>{copy.newsTitle}</h2>
            <p>{copy.newsSummary}</p>
          </div>
          <div className="story-news-heading-actions">
            <Link className="story-news-all-link" href="/haberler-ve-guncellemeler">
              {locale === "tr" ? "Tüm haberler ve güncellemeler" : "All news & updates"} →
            </Link>
            <a
              className="instagram-profile-link"
              href="https://www.instagram.com/turks_without_borders/"
              rel="noreferrer"
              target="_blank"
            >
              <InstagramIcon />
              <span>
                <strong>@Turks_Without_Borders</strong>
                <small>{copy.followInstagram} ↗</small>
              </span>
            </a>
          </div>
        </div>
        <div className="container">
          {pressNews.length > 0 ? (
            <div className="story-news-grid">
              {pressNews.map((item) => {
                const title = locale === "tr" ? item.titleTr : item.titleEn;
                const abstract =
                  locale === "tr" ? item.abstractTr : item.abstractEn;
                const videoId = youtubeId(item.videoUrl);
                return (
                  <article className="story-news-card" key={item.id}>
                    {videoId ? (
                      <div className="story-news-media video-frame">
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
                      <div className="story-news-media">
                        {/* External news images are managed by administrators. */}
                        <img alt="" loading="lazy" src={item.imageUrl} />
                      </div>
                    ) : (
                      <div className="story-news-media story-news-placeholder">
                        <span>TWB</span>
                      </div>
                    )}
                    <div className="story-news-copy">
                      <div className="story-news-meta">
                        {item.sourceName && <span>{item.sourceName}</span>}
                        {item.publishedAt && (
                          <time dateTime={item.publishedAt}>
                            {formatNewsDate(item.publishedAt, locale)}
                          </time>
                        )}
                      </div>
                      <h3>{title}</h3>
                      <p>{abstract}</p>
                      <div className="story-news-actions">
                        {item.articleUrl && (
                          <a href={item.articleUrl} rel="noreferrer" target="_blank">
                            {copy.readNews} ↗
                          </a>
                        )}
                        {item.videoUrl && !videoId && (
                          <a href={item.videoUrl} rel="noreferrer" target="_blank">
                            {copy.watchVideo} ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="story-news-empty">
              <span className="eyebrow">{copy.newsEyebrow}</span>
              <p>{copy.newsEmpty}</p>
              <a
                href="https://www.instagram.com/turks_without_borders/"
                rel="noreferrer"
                target="_blank"
              >
                <InstagramIcon />
                @Turks_Without_Borders ↗
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
