import { describe, expect, it } from "vitest";
import { portfolio } from "./portfolio";

describe("portfolio content", () => {
  // Guards against accidental CV chronology or public-link drift.
  it("preserves the approved career chronology and public links", () => {
    expect(portfolio.roles.map((role) => role.company)).toEqual([
      "Madar Logistics Platform — an Elm company",
      "T-Vencubator",
      "Digital Roots GTC",
      "Softlock",
    ]);
    expect(portfolio.links.github).toBe("https://github.com/BugsBountyHunter");
    expect(portfolio.links.email).toBe("mailto:developersaber@gmail.com");
  });

  // Guards against the site drifting from the CV sent to employers.
  it("matches the approved CV positioning", () => {
    expect(portfolio.profile.title).toBe("Senior Software Engineer & Team Lead");
    expect(portfolio.roles[0].title).toBe("Senior Software Engineer, Team Lead");
    expect(portfolio.roles[1].title).toBe("Software Engineer");
    expect(portfolio.metrics.map((metric) => metric.value)).not.toContain("20–30%");
    expect(portfolio.projects.map((project) => project.name)).toContain("Layout Fixer");
  });
});
