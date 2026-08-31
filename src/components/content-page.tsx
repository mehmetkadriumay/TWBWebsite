import { notFound } from "next/navigation";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug } from "@/lib/i18n";
import { PageHero } from "@/components/page-hero";

export async function ContentPage({
  highlightVision = false,
  slug,
}: {
  highlightVision?: boolean;
  slug: string;
}) {
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
          {page.body.split(/\n\n+/).map((paragraph, index) => {
            const visionMatch = highlightVision
              ? paragraph.match(/^(Vizyonumuz|Our vision)\s*[;:]?\s*(.*)$/is)
              : null;
            return visionMatch ? (
              <p
                className="vision-statement"
                key={`${paragraph.slice(0, 20)}-${index}`}
              >
                <strong>
                  {visionMatch[1] === "Vizyonumuz" ? "Vizyonumuz" : "Our Vision"}
                </strong>
                <span>{visionMatch[2]}</span>
              </p>
            ) : (
              <p key={`${paragraph.slice(0, 20)}-${index}`}>{paragraph}</p>
            );
          })}
        </div>
      </section>
    </>
  );
}
