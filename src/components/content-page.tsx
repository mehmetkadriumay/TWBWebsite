import { notFound } from "next/navigation";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";

export async function ContentPage({ slug }: { slug: string }) {
  const locale = await getLocale();
  const page = getPage(localizedSlug(slug, locale));
  if (!page) notFound();

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        summary={page.summary}
      />
      <section className="section">
        <div className="container narrow prose-card">
          {page.body.split(/\n\n+/).map((paragraph, index) => (
            <p key={`${paragraph.slice(0, 20)}-${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>
    </>
  );
}
