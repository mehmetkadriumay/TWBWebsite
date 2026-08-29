import type { Metadata } from "next";
import { ArrowIcon, PeopleIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug, ui } from "@/lib/i18n";

export const metadata: Metadata = { title: "Projeye Katılım" };

export default async function JoinPage() {
  const locale = await getLocale();
  const copy = ui[locale].join;
  const page = getPage(localizedSlug("projeye-katilim", locale));
  if (!page) return null;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} summary={page.summary} />
      <section className="section">
        <div className="container role-grid">
          {copy.roles.map(([title, text], index) => (
            <article key={title}>
              <span className="role-icon"><PeopleIcon /></span>
              <small>0{index + 1}</small>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="container narrow prose-card join-copy">
          {page.body.split(/\n\n+/).map((paragraph, index) => (
            <p key={`${paragraph.slice(0, 20)}-${index}`}>{paragraph}</p>
          ))}
          <a
            className="button button-primary"
            href="mailto:hello@turkswithoutborders.net?subject=Projeye%20Katılım"
          >
            {copy.apply} <ArrowIcon />
          </a>
        </div>
      </section>
    </>
  );
}
