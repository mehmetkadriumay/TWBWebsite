import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  summary: string;
  action?: ReactNode;
};

export function PageHero({ eyebrow, title, summary, action }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      {action && <div className="page-hero-action">{action}</div>}
      <div className="container narrow page-hero-content">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{summary}</p>
      </div>
    </section>
  );
}
