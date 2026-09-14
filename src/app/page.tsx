import { portfolio } from "@/content/portfolio";
import { Architecture } from "@/components/Architecture";
import { Capabilities } from "@/components/Capabilities";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Foundation } from "@/components/Foundation";
import { Hero } from "@/components/Hero";
import { Metrics } from "@/components/Metrics";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  const stack = [portfolio.capabilities[0].tags[1], portfolio.capabilities[1].tags[0], portfolio.capabilities[2].tags[0], portfolio.capabilities[2].tags[2]];

  return (
    <>
      <SiteHeader name={portfolio.profile.name} email={portfolio.links.email} />
      <main id="main">
        <Hero profile={portfolio.profile} links={portfolio.links}><Architecture stack={stack} /></Hero>
        <Metrics metrics={portfolio.metrics} />
        <Experience roles={portfolio.roles} />
        <Capabilities capabilities={portfolio.capabilities} />
        <Foundation education={portfolio.education} languages={portfolio.languages} />
        <Contact email={portfolio.links.email} />
      </main>
      <SiteFooter profile={portfolio.profile} links={portfolio.links} />
      <Reveal />
    </>
  );
}
