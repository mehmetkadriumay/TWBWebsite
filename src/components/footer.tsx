import Link from "next/link";
import { EmailIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { type Locale, ui } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const copy = ui[locale].footer;
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p>{copy.summary}</p>
        </div>
        <div className="footer-links">
          <strong>{copy.explore}</strong>
          <Link href="/bizim-hikayemiz">{copy.story}</Link>
          <Link href="/nasil-calisiyoruz">{copy.how}</Link>
          <Link href="/konusma-konulari">{copy.topics}</Link>
        </div>
        <div className="footer-links">
          <strong>{copy.contact}</strong>
          <a
            aria-label={
              locale === "tr"
                ? "Serpil İngeç ve Ülkü Umay'a e-posta gönder"
                : "Email Serpil İngeç and Ülkü Umay"
            }
            className="footer-email-link"
            href="mailto:serpil_ingec@hotmail.com,ulkuumay@hotmail.com"
            title={
              locale === "tr"
                ? "E-posta gönder"
                : "Send an email"
            }
          >
            <EmailIcon size={23} />
          </a>
          <Link href="/projeye-katilim">{copy.join}</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Turks Without Borders</span>
        <span>{copy.note}</span>
      </div>
    </footer>
  );
}
