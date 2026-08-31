import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowIcon, UploadIcon } from "@/components/icons";
import { AdminWorkspace } from "@/components/admin-workspace";
import { LogoutButton } from "@/components/logout-button";
import { isAdmin } from "@/lib/auth";
import {
  getAcademicCalendar,
  getPages,
  getSchools,
  getStudents,
  getWeeks,
} from "@/lib/db";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Yönetim Paneli" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const locale = await getLocale();
  const [pages, weeks, calendar, schools, students] = await Promise.all([
    getPages(),
    getWeeks(),
    getAcademicCalendar(),
    getSchools(),
    getStudents(),
  ]);

  return (
    <section className="admin-section">
      <div className="container">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">
              {locale === "tr" ? "Yönetim paneli" : "Admin dashboard"}
            </span>
            <h1>
              {locale === "tr" ? "İçerik, her zaman güncel." : "Keep every page current."}
            </h1>
            <p>
              {locale === "tr"
                ? "Yayımlanan sayfaları ve haftalık sohbet programını yönetin."
                : "Manage published pages and the weekly conversation program."}
            </p>
          </div>
          <LogoutButton locale={locale} />
        </div>
        <div className="admin-stats">
          <article><strong>{pages.length}</strong><span>{locale === "tr" ? "Düzenlenebilir sayfa" : "Editable pages"}</span></article>
          <article><strong>{weeks.length}</strong><span>{locale === "tr" ? "Yayımlanmış hafta" : "Published weeks"}</span></article>
          <Link href="/konusma-konulari">
            <UploadIcon />
            <span>
              <strong>{locale === "tr" ? "Excel yönetimi" : "Excel management"}</strong>
              <small>{locale === "tr" ? "İçe aktar veya hafta sil" : "Import or delete a week"}</small>
            </span>
            <ArrowIcon />
          </Link>
        </div>
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">{locale === "tr" ? "Sayfa editörü" : "Page editor"}</span>
            <h2>{locale === "tr" ? "Site metinlerini düzenle" : "Edit website content"}</h2>
          </div>
          <small>
            {locale === "tr"
              ? "Kaydettiğiniz değişiklikler anında yayımlanır."
              : "Saved changes are published immediately."}
          </small>
        </div>
        <AdminWorkspace
          calendar={calendar}
          locale={locale}
          pages={pages}
          schools={schools}
          students={students}
        />
      </div>
    </section>
  );
}
