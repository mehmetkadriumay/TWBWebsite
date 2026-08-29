type PageHeroProps = {
  eyebrow: string;
  title: string;
  summary: string;
};

export function PageHero({ eyebrow, title, summary }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="container narrow page-hero-content">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{summary}</p>
      </div>
    </section>
  );
}
