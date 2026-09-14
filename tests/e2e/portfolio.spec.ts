import { expect, test } from "@playwright/test";
import { PortfolioPage } from "./pages/PortfolioPage";

test.use({ screenshot: "only-on-failure" });

test("uses the approved responsive layout", async ({ page }, testInfo) => {
  const portfolio = new PortfolioPage(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await portfolio.goto();
  await portfolio.waitForFonts();
  const mobile = testInfo.project.name === "mobile";
  await expect(portfolio.header).toHaveCSS("position", "sticky");
  await expect(portfolio.header).toHaveCSS("top", "0px");
  const positions = await portfolio.metricPositions();
  expect(new Set(positions.map(({ x }) => x)).size).toBe(mobile ? 2 : 4);
  expect(new Set(positions.map(({ y }) => y)).size).toBe(mobile ? 2 : 1);
  const heading = await portfolio.heading.boundingBox();
  const architecture = await portfolio.architecture.boundingBox();
  expect(heading).not.toBeNull();
  expect(architecture).not.toBeNull();
  if (mobile) {
    expect(architecture!.y).toBeGreaterThan(heading!.y + heading!.height);
    await expect(portfolio.menu).toBeVisible();
    await expect(portfolio.navigation).toBeHidden();
  } else {
    expect(architecture!.x).toBeGreaterThan(heading!.x + heading!.width);
    await expect(portfolio.menu).toBeHidden();
    await expect(portfolio.navigation).toBeVisible();
  }
  const cards = await portfolio.capabilities.getByRole("article").evaluateAll((articles) => articles.map((article) => article.getBoundingClientRect().x));
  expect(new Set(cards).size).toBe(mobile ? 1 : 2);
});

test("has no horizontal overflow on desktop or mobile", async ({ page }) => {
  const portfolio = new PortfolioPage(page);
  await portfolio.goto();
  const dimensions = await portfolio.documentMeasurements();
  expect(dimensions.scrollWidth).toBe(dimensions.width);
  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.width);
  expect(dimensions.bodyFontSize).toBeGreaterThanOrEqual(16);
});

test("has no horizontal overflow at responsive breakpoint boundaries", async ({ page }) => {
  const portfolio = new PortfolioPage(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [680, 681, 900, 901]) {
    await page.setViewportSize({ width, height: 1000 });
    await portfolio.goto();
    await portfolio.waitForFonts();
    await expect.poll(async () => (await portfolio.documentMeasurements()).scrollWidth).toBe(width);
  }
});

test("renders the approved portfolio structure", async ({ page }) => {
  const portfolio = new PortfolioPage(page);
  await portfolio.goto();
  await expect(portfolio.experience.getByRole("article")).toHaveCount(4);
  await expect(portfolio.capabilities.getByRole("article")).toHaveCount(4);
  await expect(portfolio.heading).toContainText("move business forward");
  await expect(page.getByRole("link", { name: /start a conversation/i })).toHaveAttribute("href", "mailto:developersaber@gmail.com");
  await expect(portfolio.sections).toHaveCount(5);
  expect(await portfolio.sections.evaluateAll((sections) => sections.map((section) => section.id))).toEqual(["top", "experience", "capabilities", "about", "contact"]);
  await expect(portfolio.foundation.getByRole("article")).toHaveCount(2);
});

test("animated orbit does not add horizontal scrolling", async ({ page }) => {
  const portfolio = new PortfolioPage(page);
  await page.setViewportSize({ width: 901, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await portfolio.goto();
  await portfolio.waitForFonts();
  // Freeze the rotating squares at a diagonal, where their overflow boxes are widest.
  await portfolio.architecture.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getTiming().duration) / 8;
    }
  });
  await expect.poll(async () => (await portfolio.documentMeasurements()).scrollWidth).toBe(901);
});

test("mobile navigation exposes section links and closes after choosing one", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Menu interaction belongs to the mobile viewport");
  const portfolio = new PortfolioPage(page);
  await portfolio.goto();
  await expect(portfolio.menu).toHaveAttribute("aria-controls", "primary-nav");
  await expect(portfolio.navigation).toBeHidden();
  await portfolio.menu.click();
  await expect(portfolio.menu).toHaveAttribute("aria-expanded", "true");
  await expect(portfolio.navigation).toBeVisible();
  for (const name of ["Experience", "Capabilities", "About", "Let's talk"]) {
    await expect(portfolio.navigation.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await portfolio.navigation.getByRole("link", { name: "Experience", exact: true }).click();
  await expect(portfolio.menu).toHaveAttribute("aria-expanded", "false");
  await expect(portfolio.navigation).toBeHidden();
  await expect(page).toHaveURL(/#experience$/);
});

test("reveal content remains visible with reduced motion", async ({ page }) => {
  const portfolio = new PortfolioPage(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await portfolio.goto();
  await expect.poll(() => portfolio.sectionVisibility()).not.toContain(false);
  await expect(portfolio.contactHeading).toBeVisible();
});

test("reveal content remains visible without IntersectionObserver", async ({ page }) => {
  const portfolio = new PortfolioPage(page);
  await page.addInitScript(() => { delete (window as unknown as Record<string, unknown>).IntersectionObserver; });
  await portfolio.goto();
  await expect.poll(() => portfolio.sectionVisibility()).not.toContain(false);
  await expect(portfolio.contactHeading).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("server content is visible before hydration", async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();
    await expect(portfolio.experience.getByRole("article")).toHaveCount(4);
    await expect.poll(() => portfolio.sectionVisibility()).not.toContain(false);
    await expect(portfolio.contactHeading).toBeVisible();
  });
});
