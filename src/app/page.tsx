import Link from "next/link";
import { ArrowIcon, GlobeIcon, PeopleIcon, SparkIcon } from "@/components/icons";
import { getPage } from "@/lib/db";
import { getLocale, localizedSlug, ui } from "@/lib/i18n";

export default async function Home() {
  const locale = await getLocale();
  const copy = ui[locale].home;
  const page = getPage(localizedSlug("home", locale));
  if (!page) return null;

  return (
    <>
      <section className="home-hero">
        <div className="hero-grid-pattern" />
        <div className="container home-hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <SparkIcon size={16} /> {page.eyebrow}
            </span>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/projeye-katilim">
                {copy.join} <ArrowIcon />
              </Link>
              <Link className="text-link" href="/nasil-calisiyoruz">
                {copy.how} <ArrowIcon />
              </Link>
            </div>
            <div className="trust-row">
              <span className="avatar-stack" aria-hidden="true">
                <i>TR</i><i>US</i><i>+</i>
              </span>
              <span>{copy.trust}</span>
            </div>
          </div>
          <div className="hero-visual" aria-label={copy.visualLabel}>
            <div className="visual-globe">
              <GlobeIcon size={150} />
              <span className="location-pin pin-tr">TR</span>
              <span className="location-pin pin-us">US</span>
              <span className="connection-line" />
            </div>
            <div className="floating-card floating-card-one">
              <span>{copy.weeklyTopic}</span>
              <strong>Let&apos;s talk about friendship</strong>
            </div>
            <div className="floating-card floating-card-two">
              <PeopleIcon />
              <span><strong>{copy.live}</strong><small>{copy.safeGroups}</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro-section">
        <div className="container split-heading">
          <div>
            <span className="eyebrow">{copy.brand}</span>
            <h2>{copy.intro}</h2>
          </div>
          <div>
            <p>{page.body}</p>
            <Link className="text-link" href="/bizim-hikayemiz">
              {copy.discover} <ArrowIcon />
            </Link>
          </div>
        </div>
        <div className="container value-grid">
          <article>
            <span className="value-number">01</span>
            <GlobeIcon />
            <h3>{copy.values[0][0]}</h3>
            <p>{copy.values[0][1]}</p>
          </article>
          <article>
            <span className="value-number">02</span>
            <PeopleIcon />
            <h3>{copy.values[1][0]}</h3>
            <p>{copy.values[1][1]}</p>
          </article>
          <article>
            <span className="value-number">03</span>
            <SparkIcon />
            <h3>{copy.values[2][0]}</h3>
            <p>{copy.values[2][1]}</p>
          </article>
        </div>
      </section>

      <section className="section quote-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow eyebrow-light">{copy.voices}</span>
            <h2>{copy.voicesTitle}</h2>
          </div>
          <div className="testimonial-grid">
            {copy.testimonials.map(([quote, place, initials]) => (
              <blockquote key={place}>
                <span className="quote-mark">“</span>
                <p>{quote}</p>
                <footer>
                  <span>{initials}</span>
                  <div><strong>{copy.student}</strong><small>{place}</small></div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-panel">
          <div>
            <span className="eyebrow eyebrow-light">{copy.newGroups}</span>
            <h2>{copy.cta}</h2>
          </div>
          <Link className="button button-white" href="/projeye-katilim">
            {copy.joinProject} <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
