import { describe, expect, it } from "vitest";
import { portfolio } from "./portfolio";

describe("portfolio content", () => {
  // Guards against accidental CV chronology or public-link drift.
  it("preserves the approved career chronology and public links", () => {
    expect(portfolio.roles.map((role) => role.company)).toEqual([
      "Madar — Obeikan Digital Solutions",
      "T-Vencubator",
      "Digital Roots GTC",
      "Softlock",
    ]);
    expect(portfolio.links.github).toBe("https://github.com/BugsBountyHunter");
    expect(portfolio.links.email).toBe("mailto:developersaber@gmail.com");
  });
});
