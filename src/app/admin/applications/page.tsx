import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationManagement } from "@/components/application-management";
import { LogoutButton } from "@/components/logout-button";
import { isAdmin } from "@/lib/auth";
import { getParticipationApplications } from "@/lib/db";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Başvurular | Yönetim Paneli" };
export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [locale, applications] = await Promise.all([
    getLocale(),
    getParticipationApplications(),
  ]);

  return (
    <section className="admin-section">
      <div className="container">
        <div className="admin-heading">
          <div>
            <Link className="back-to-grid" href="/admin">
              ← {locale === "tr" ? "Yönetim paneli" : "Admin dashboard"}
            </Link>
            <span className="eyebrow">
              {locale === "tr" ? "Başvuru yönetimi" : "Application management"}
            </span>
            <h1>{locale === "tr" ? "Başvuruları değerlendir" : "Review applications"}</h1>
            <p>
              {locale === "tr"
                ? "Başvuru bilgilerini inceleyin; onaylanan kayıtlar otomatik olarak doğru öğrenci tablosuna aktarılır."
                : "Review each submission; approved entries are automatically added to the correct student table."}
            </p>
          </div>
          <LogoutButton locale={locale} />
        </div>
        <ApplicationManagement
          initialApplications={applications}
          locale={locale}
        />
      </div>
    </section>
  );
}
