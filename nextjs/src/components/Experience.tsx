import type { Portfolio } from "@/content/portfolio";

export function Experience({ roles }: { roles: Portfolio["roles"] }) {
  return (
    <section id="experience">
      <div className="wrap">
        <div className="section-head reveal visible"><span className="kicker">01 / Experience</span><h2>Built in the real world, across complex domains.</h2></div>
        <div className="timeline">
          {roles.map((role) => (
            <article className="role reveal visible" key={role.company}>
              <time>{role.period}</time>
              <div>
                <div className="role-top"><h3>{role.title} · {role.company}</h3><span className="place">{role.domain} · {role.mode}</span></div>
                <p>{role.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
