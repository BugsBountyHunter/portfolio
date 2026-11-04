import type { Portfolio } from "@/content/portfolio";

export function Projects({ projects }: { projects: Portfolio["projects"] }) {
  return (
    <section id="projects">
      <div className="wrap">
        <div className="section-head reveal visible"><span className="kicker">03 / Projects</span><h2>Tools built and shared in the open.</h2></div>
        <div className="profile-grid">
          {projects.map((project) => (
            <article className="profile-card reveal visible" key={project.name}>
              <span className="kicker">Open source</span>
              <h3><a href={project.href} target="_blank" rel="noreferrer">{project.name} ↗</a></h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
