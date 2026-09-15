import type { ReactNode } from "react";
import type { Portfolio } from "@/content/portfolio";

export function Hero({ profile, links, children }: { profile: Portfolio["profile"]; links: Pick<Portfolio["links"], "email" | "github">; children: ReactNode }) {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow"><span className="status-dot" aria-hidden="true" />{profile.title} · {profile.location.split(",")[0]}</div>
          <h1>I engineer systems that <span className="accent">move business forward.</span></h1>
          <p className="hero-copy">{profile.summary}</p>
          <div className="actions">
            <a className="button primary" href={links.email}>Start a conversation <span aria-hidden="true">↗</span></a>
            <a className="button" href={links.github} target="_blank" rel="noreferrer">Explore GitHub</a>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
