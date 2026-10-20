import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug } from "@/lib/i18n";
import { foundersSections, managedSection } from "@/lib/site-sections";

export const metadata: Metadata = { title: "Kurucularımız" };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export default async function FoundersPage() {
  const locale = await getLocale();
  const page = await getPage(localizedSlug("kurucularimiz", locale));
  if (!page) return null;
  const copy = managedSection(
    page.sections,
    "founders",
    foundersSections(locale),
  );

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        summary={page.summary}
        title={page.title}
      />
      <section className="section founders-section">
        <div className="container founders-heading">
          <div>
            <span className="eyebrow">{copy.sectionEyebrow}</span>
            <h2>{copy.sectionTitle}</h2>
          </div>
          <div>
            {page.body.split(/\n\n+/).map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
            ))}
            <p>{copy.sectionSummary}</p>
          </div>
        </div>
        <div className="container founders-grid">
          {copy.founders.map((founder) => (
            <article className="founder-card" key={founder.name}>
              <div className="founder-photo">
                {founder.imageUrl ? (
                  <img alt={founder.name} src={founder.imageUrl} />
                ) : (
                  <span>{initials(founder.name)}</span>
                )}
              </div>
              <div className="founder-copy">
                <span>{founder.role}</span>
                <h2>{founder.name}</h2>
                <p>{founder.biography}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
