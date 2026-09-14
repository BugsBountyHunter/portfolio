import type { Portfolio } from "@/content/portfolio";

export function Foundation({ education, languages }: { education: Portfolio["education"]; languages: Portfolio["languages"] }) {
  return (
    <section id="about">
      <div className="wrap">
        <div className="section-head reveal visible"><span className="kicker">03 / Foundation</span><h2>Technical depth, grounded in continuous learning.</h2></div>
        <div className="profile-grid">
          <article className="profile-card reveal visible"><span className="kicker">Education</span><h3>{education.degree}</h3><p>{education.institution}<br />{education.period}</p></article>
          <article className="profile-card reveal visible"><span className="kicker">Languages</span><h3>{languages.match(/Arabic|English/g)?.join(" & ")}</h3><p>{languages}</p></article>
        </div>
      </div>
    </section>
  );
}
