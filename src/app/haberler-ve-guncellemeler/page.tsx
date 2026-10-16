import type { Metadata } from "next";
import { NewsUpdatesArchive } from "@/components/news-updates-archive";
import { PageHero } from "@/components/page-hero";
import { getNews } from "@/lib/db";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Haberler ve Güncellemeler",
  description:
    "Turks Without Borders haberleri, kısa güncellemeleri, videoları ve blog içerikleri.",
};
export const dynamic = "force-dynamic";

export default async function NewsUpdatesPage() {
  const [locale, items] = await Promise.all([getLocale(), getNews()]);
  return (
    <>
      <PageHero
        eyebrow={locale === "tr" ? "GÜNCEL KALIN" : "STAY CURRENT"}
        summary={
          locale === "tr"
            ? "Kısa proje güncellemelerini, hakkımızdaki haberleri, videoları ve blog bağlantılarını tek bir arşivde keşfedin."
            : "Explore short project updates, news coverage, videos, and blog links in one searchable archive."
        }
        title={
          locale === "tr"
            ? "Haberler ve Güncellemeler"
            : "News & Updates"
        }
      />
      <section className="section news-archive-section">
        <div className="container">
          <NewsUpdatesArchive items={items} locale={locale} />
        </div>
      </section>
    </>
  );
}
