import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Bizim Hikâyemiz" };

const videos = [
  {
    id: "sPXLQtMGHXI",
    duration: "12:30",
    title: "Turks Without Borders",
    publisher: "TACAWA Social Support",
  },
  {
    id: "O_XBZTjMiUY",
    duration: "52:17",
    title: "Turks Without Borders Project",
    publisher: "Assembly of Turkish American Associations",
  },
] as const;

const copy = {
  tr: {
    eyebrow: "PROJE VİDEOLARI",
    title: "Hikâyemizi anlatan iki resmi kayıt.",
    summary:
      "Projenin nasıl doğduğunu, kimler tarafından yürütüldüğünü ve öğrenciler arasında nasıl bir kültür ve dil köprüsü kurduğunu doğrudan proje ekibinden dinleyin.",
    descriptions: [
      "TACAWA Sosyal Dayanışma ekibi tarafından hazırlanan Turks Without Borders proje filmi.",
      "Projenin kurucuları Ülkü Umay ve Serpil İngeç'in proje modelini tanıttığı ve soruları yanıtladığı kapsamlı sunum.",
    ],
    watch: "YouTube'da izle",
    duration: "Süre",
    publishedBy: "Yayımlayan",
  },
  en: {
    eyebrow: "PROJECT VIDEOS",
    title: "Two official recordings that tell our story.",
    summary:
      "Hear directly from the project team about how the program began, who leads it, and how it builds a bridge of language and culture between students.",
    descriptions: [
      "A Turks Without Borders project film produced by the TACAWA Social Support team.",
      "An in-depth presentation and Q&A in which project founders Ülkü Umay and Serpil İngeç introduce the program model.",
    ],
    watch: "Watch on YouTube",
    duration: "Duration",
    publishedBy: "Published by",
  },
} as const;

export default async function StoryPage() {
  const locale = await getLocale();
  const localizedCopy = copy[locale];

  return (
    <>
      <ContentPage highlightVision slug="bizim-hikayemiz" />
      <section className="section project-videos">
        <div className="container project-videos-heading">
          <div>
            <span className="eyebrow">{localizedCopy.eyebrow}</span>
            <h2>{localizedCopy.title}</h2>
          </div>
          <p>{localizedCopy.summary}</p>
        </div>
        <div className="container project-video-grid">
          {videos.map((video, index) => (
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
                  <span>{localizedCopy.duration}: {video.duration}</span>
                  <span>{localizedCopy.publishedBy}: {video.publisher}</span>
                </div>
                <h3>{video.title}</h3>
                <p>{localizedCopy.descriptions[index]}</p>
                <a
                  href={`https://youtu.be/${video.id}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {localizedCopy.watch} ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
