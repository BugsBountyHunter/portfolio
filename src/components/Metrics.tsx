import type { Portfolio } from "@/content/portfolio";

export function Metrics({ metrics }: { metrics: Portfolio["metrics"] }) {
  return (
    <div className="wrap metrics reveal visible" role="group" aria-label="Career highlights">
      {metrics.map((metric) => <div className="metric" key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}
    </div>
  );
}
