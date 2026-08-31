import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug } from "@/lib/i18n";

export const metadata: Metadata = { title: "Nasıl Çalışıyoruz" };

const copy = {
  tr: {
    sectionEyebrow: "PROGRAM MODELİ",
    sectionTitle: "Geçmişten ilham alan, gençlerle gelişen bir model.",
    sectionSummary:
      "Mektup arkadaşlığından çevrim içi görüşmelere uzanan yapımızı, kimlerin yürüttüğünü ve gençlere ne kazandırmayı amaçladığımızı keşfedin.",
    headings: [
      "Mektup arkadaşlığından yüz yüze görüşmelere",
      "Gönüllü eğitimciler, güvenli ve planlı sohbetler",
      "Gençlerin yön verdiği kişisel gelişim ortamı",
    ],
    labels: ["Köken ve yapı", "Programın işleyişi", "Hedefler ve gelişim"],
    principlesTitle: "Programın temel bileşenleri",
    principles: [
      ["İki ülke", "Türkiye ile Amerika Birleşik Devletleri arasında düzenli bağlantı"],
      ["Gönüllülük", "Profesyonel eğitimcilik deneyimine sahip gönüllü ekip"],
      ["Haftalık diyalog", "Önceden belirlenen konular etrafında karşılıklı İngilizce konuşma"],
      ["Genç liderliği", "Karar alan, sonuçları değerlendiren ve sorumluluk üstlenen katılımcılar"],
    ],
  },
  en: {
    sectionEyebrow: "PROGRAM MODEL",
    sectionTitle: "Inspired by the past and continually improved by young people.",
    sectionSummary:
      "Explore how the project developed from pen-pal exchanges into online conversations, who leads it, and what it is designed to give young participants.",
    headings: [
      "From pen pals to face-to-face conversations",
      "Volunteer educators and safe, planned discussions",
      "A youth-led environment for personal growth",
    ],
    labels: ["Origins and structure", "How the program operates", "Goals and development"],
    principlesTitle: "Core elements of the program",
    principles: [
      ["Two countries", "A consistent connection between Türkiye and the United States"],
      ["Volunteer-led", "A volunteer team with professional education experience"],
      ["Weekly dialogue", "Two-way English conversation around topics prepared in advance"],
      ["Youth leadership", "Participants who make decisions, evaluate results, and accept responsibility"],
    ],
  },
} as const;

export default async function HowItWorksPage() {
  const locale = await getLocale();
  const page = await getPage(localizedSlug("nasil-calisiyoruz", locale));
  if (!page) return null;
  const localizedCopy = copy[locale];
  const paragraphs = page.body.split(/\n\n+/);

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} summary={page.summary} />
      <section className="section how-section">
        <div className="container how-intro">
          <div>
            <span className="eyebrow">{localizedCopy.sectionEyebrow}</span>
            <h2>{localizedCopy.sectionTitle}</h2>
          </div>
          <p>{localizedCopy.sectionSummary}</p>
        </div>

        <div className="container how-story">
          {paragraphs.map((paragraph, index) => (
            <article key={`${paragraph.slice(0, 30)}-${index}`}>
              <div className="how-story-heading">
                <span>0{index + 1}</span>
                <small>{localizedCopy.labels[index] ?? localizedCopy.sectionEyebrow}</small>
                <h3>{localizedCopy.headings[index] ?? page.title}</h3>
              </div>
              <p>{paragraph}</p>
            </article>
          ))}
        </div>

        <div className="container how-principles">
          <h2>{localizedCopy.principlesTitle}</h2>
          <div>
            {localizedCopy.principles.map(([title, description], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
