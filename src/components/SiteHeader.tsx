import type { Portfolio } from "@/content/portfolio";
import { MobileNav } from "./MobileNav";

export function SiteHeader({ name, email }: { name: Portfolio["profile"]["name"]; email: Portfolio["links"]["email"] }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" aria-label={`${name}, home`}>
            <span className="brand-mark" aria-hidden="true">{name.split(" ").map((part) => part[0]).join("")}</span>
            <span>{name}</span>
          </a>
          <MobileNav email={email} />
        </div>
      </header>
    </>
  );
}
