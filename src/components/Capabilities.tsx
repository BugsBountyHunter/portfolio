import type { Portfolio } from "@/content/portfolio";

export function Capabilities({ capabilities }: { capabilities: Portfolio["capabilities"] }) {
  return (
    <section className="capabilities" id="capabilities">
      <div className="wrap">
        <div className="section-head reveal visible"><span className="kicker">02 / Capabilities</span><h2>End-to-end thinking, from architecture to interface.</h2></div>
        <div className="cap-grid">
          {capabilities.map((capability, index) => (
            <article className="cap-card reveal visible" key={capability.label}>
              <span className="cap-no">{String(index + 1).padStart(2, "0")} · {capability.label}</span>
              <h3>{capability.headline}</h3>
              <div className="tags">{capability.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
