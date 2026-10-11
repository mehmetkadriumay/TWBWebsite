import Link from "next/link";
import { EmailIcon, InstagramIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { getPage } from "@/lib/db";
import { localizedSlug, type Locale, ui } from "@/lib/i18n";
import { managedSection } from "@/lib/site-sections";

export async function Footer({ locale }: { locale: Locale }) {
  const page = await getPage(localizedSlug("home", locale));
  const copy = managedSection(page?.sections ?? {}, "footer", ui[locale].footer);
  const contact = managedSection(page?.sections ?? {}, "contact", {
    emailRecipients: "serpil_ingec@hotmail.com,ulkuumay@hotmail.com",
    emailLabel:
      locale === "tr"
        ? "Serpil İngeç ve Ülkü Umay'a e-posta gönder"
        : "Email Serpil İngeç and Ülkü Umay",
    emailTitle: locale === "tr" ? "E-posta gönder" : "Send an email",
    instagramUrl: "https://www.instagram.com/turks_without_borders/",
    instagramLabel:
      locale === "tr"
        ? "Turks Without Borders Instagram profilini aç"
        : "Open the Turks Without Borders Instagram profile",
  });
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
          <div className="footer-social-links">
            <a
              aria-label={contact.emailLabel}
              className="footer-email-link"
              href={`mailto:${contact.emailRecipients}`}
              title={contact.emailTitle}
            >
              <EmailIcon size={23} />
            </a>
            <a
              aria-label={contact.instagramLabel}
              className="footer-email-link"
              href={contact.instagramUrl}
              rel="noreferrer"
              target="_blank"
            >
              <InstagramIcon size={23} />
            </a>
          </div>
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
