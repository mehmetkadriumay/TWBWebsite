import Link from "next/link";
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
          <a href="mailto:hello@turkswithoutborders.net">
            hello@turkswithoutborders.net
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
