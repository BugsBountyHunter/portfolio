export function Architecture({ stack }: { stack: readonly string[] }) {
  return (
    <div className="architecture" role="img" aria-label={`Software architecture stack: ${stack.join(", ")}`}>
      <div className="orbit one" aria-hidden="true"><i /></div>
      <div className="orbit two" aria-hidden="true"><i /></div>
      <div className="core" aria-hidden="true">
        <span className="core-label">Core system</span>
        <strong>Scalable by design.</strong>
        <div className="core-line" />
        <div className="core-stack">{stack.map((technology) => <span key={technology}>{technology}</span>)}</div>
      </div>
    </div>
  );
}
