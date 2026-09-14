import type { Page } from "@playwright/test";

export class PortfolioPage {
  constructor(readonly page: Page) {}

  readonly header = this.page.getByRole("banner");
  readonly navigation = this.page.getByRole("navigation", { name: "Primary navigation" });
  readonly menu = this.page.getByRole("button", { name: /^(Open|Close) navigation$/ });
  readonly heading = this.page.getByRole("heading", { level: 1 });
  readonly architecture = this.page.getByRole("img", { name: /^Software architecture stack:/ });
  readonly metrics = this.page.getByRole("group", { name: "Career highlights" });
  readonly sections = this.page.getByRole("main").locator(":scope > section");
  readonly experience = this.sections.filter({ has: this.page.getByRole("heading", { name: "Built in the real world, across complex domains." }) });
  readonly capabilities = this.sections.filter({ has: this.page.getByRole("heading", { name: "End-to-end thinking, from architecture to interface." }) });
  readonly foundation = this.sections.filter({ has: this.page.getByRole("heading", { name: "Technical depth, grounded in continuous learning." }) });
  readonly contactHeading = this.page.getByRole("heading", { name: "Let’s build something that works beautifully." });

  async goto() {
    await this.page.goto("/");
  }

  async waitForFonts() {
    await this.page.evaluate(() => document.fonts.ready);
  }

  async documentMeasurements() {
    return this.page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      bodyFontSize: parseFloat(getComputedStyle(document.body).fontSize),
    }));
  }

  async metricPositions() {
    return this.metrics.locator(":scope > div").evaluateAll((metrics) => metrics.map((metric) => {
      const { x, y } = metric.getBoundingClientRect();
      return { x, y };
    }));
  }

  async sectionVisibility() {
    return this.sections.evaluateAll((sections) => sections.flatMap((section) =>
      Array.from(section.querySelectorAll("h2, article"), (element) => {
        for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
          if (style.opacity === "0" || style.visibility === "hidden" || style.display === "none") return false;
        }
        return true;
      }),
    ));
  }
}
