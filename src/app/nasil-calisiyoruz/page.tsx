import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug } from "@/lib/i18n";
import { howSections, managedSection } from "@/lib/site-sections";

export const metadata: Metadata = { title: "Nasıl Çalışıyoruz" };

export default async function HowItWorksPage() {
  const locale = await getLocale();
  const page = await getPage(localizedSlug("nasil-calisiyoruz", locale));
  if (!page) return null;
  const localizedCopy = managedSection(
    page.sections,
    "how",
    howSections(locale),
  );
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
