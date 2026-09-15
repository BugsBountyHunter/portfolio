import type { Portfolio } from "@/content/portfolio";

export function SiteFooter({ profile, links }: { profile: Pick<Portfolio["profile"], "name" | "location">; links: Pick<Portfolio["links"], "linkedin" | "github"> }) {
  // This Server Component runs during static export; no client clock is needed.
  const year = new Date().getUTCFullYear();
  return (
    <footer>
      <div className="wrap footer-inner">
        <span>© <span id="year">{year}</span> {profile.name} · {profile.location}</span>
        <div className="socials"><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={links.github} target="_blank" rel="noreferrer">GitHub</a></div>
      </div>
    </footer>
  );
}
