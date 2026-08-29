import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isAdmin } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Yönetici Girişi" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const locale = await getLocale();

  return (
    <section className="auth-section">
      <div className="auth-card">
        <span className="eyebrow">
          {locale === "tr" ? "Güvenli yönetim" : "Secure administration"}
        </span>
        <h1>{locale === "tr" ? "Tekrar hoş geldiniz." : "Welcome back."}</h1>
        <p>
          {locale === "tr"
            ? "Sayfa içeriklerini ve haftalık konuşma konularını yönetin."
            : "Manage page content and weekly conversation topics."}
        </p>
        <LoginForm locale={locale} />
      </div>
    </section>
  );
}
