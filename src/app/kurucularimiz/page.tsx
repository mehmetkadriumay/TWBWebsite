import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug } from "@/lib/i18n";
import { foundersSections, managedSection } from "@/lib/site-sections";

export const metadata: Metadata = { title: "Kurucularımız" };

const founderNames = ["Ülkü Tuna Umay", "Serpil İngeç"];

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
        <div className="container founders-list">
          {copy.founders.map((founder, index) => (
            <article className="founder-profile" key={founderNames[index]}>
              <div className="founder-photo">
                {founder.imageUrl ? (
                  <img alt={founderNames[index]} src={founder.imageUrl} />
                ) : (
                  <span aria-hidden="true" />
                )}
              </div>
              <div className="founder-copy">
                <p>{founder.biography}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
