import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { WeekAdminTools } from "@/components/week-admin-tools";
import { isAdmin } from "@/lib/auth";
import { getAcademicCalendar, getWeeks } from "@/lib/db";
import { getLocale, ui } from "@/lib/i18n";
import { formatWeekDate, getWeekDate } from "@/lib/week-schedule";

export const metadata: Metadata = { title: "Konuşma Konuları" };
export const dynamic = "force-dynamic";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ hafta?: string }>;
}) {
  const weeks = getWeeks();
  const calendar = getAcademicCalendar();
  const locale = await getLocale();
  const copy = ui[locale].topics;
  const params = await searchParams;
  const requested = Number.parseInt(params.hafta ?? "", 10);
  const selected =
    weeks.find((week) => week.id === requested) ?? weeks.at(0) ?? null;
  const selectedDate = selected ? getWeekDate(selected.id, calendar) : null;
  const admin = await isAdmin();

  return (
    <>
      {admin && (
        <section className="admin-topic-top">
          <div className="container">
            <WeekAdminTools locale={locale} selectedWeek={selected?.id} />
          </div>
        </section>
      )}
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        summary={copy.summary}
      />
      <section className="section topics-section">
        <div className="container">
          {weeks.length > 0 ? (
            <>
              <div className="week-picker" aria-label={copy.picker}>
                {weeks.map((week) => (
                  <Link
                    className={week.id === selected?.id ? "active" : ""}
                    href={`/konusma-konulari?hafta=${week.id}`}
                    key={week.id}
                  >
                    <small>{copy.week}</small>
                    <strong>{week.id}</strong>
                  </Link>
                ))}
              </div>
              {selected && (
                <div className="week-content">
                  <div className="week-heading">
                    <div>
                      <span className="eyebrow">{copy.weekLabel} {selected.id}</span>
                      {selectedDate && (
                        <time dateTime={selectedDate.toISOString().slice(0, 10)}>
                          {formatWeekDate(selectedDate, locale)}
                        </time>
                      )}
                      <h2>{selected.title}</h2>
                    </div>
                    <span>{selected.topics.length} {copy.questions}</span>
                  </div>
                  <ol className="topic-list">
                    {selected.topics.map((topic) => (
                      <li key={topic.id}>
                        <span>{String(topic.position).padStart(2, "0")}</span>
                        <div>
                          {topic.category && <small>{topic.category}</small>}
                          <p>{topic.question}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span>00</span>
              <h2>{copy.emptyTitle}</h2>
              <p>
                {admin ? copy.emptyAdmin : copy.emptyPublic}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
