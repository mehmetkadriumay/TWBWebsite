import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale, ui } from "@/lib/i18n";

export async function Header({ locale }: { locale: Locale }) {
  const admin = await isAdmin();
  const copy = ui[locale].nav;
  const links = [
    { href: "/bizim-hikayemiz", label: copy.story },
    { href: "/nasil-calisiyoruz", label: copy.how },
    { href: "/konusma-konulari", label: copy.topics },
    { href: "/projeye-katilim", label: copy.join },
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav aria-label={copy.mainMenu} className="desktop-nav">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher locale={locale} />
        <Link className="button button-small button-dark" href={admin ? "/admin" : "/admin/login"}>
          {admin ? copy.admin : copy.login}
        </Link>
        <details className="mobile-menu">
          <summary aria-label={copy.openMenu}>
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label={copy.mobileMenu}>
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
