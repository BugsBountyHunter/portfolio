import { expect, test } from "@playwright/test";

test("renders the approved portfolio structure", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#experience article")).toHaveCount(4);
  await expect(page.locator("#capabilities article")).toHaveCount(4);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("move business forward");
  await expect(page.getByRole("link", { name: /start a conversation/i })).toHaveAttribute("href", "mailto:developersaber@gmail.com");
  await expect(page.locator("main > section")).toHaveCount(5);
  expect(await page.locator("main > section").evaluateAll((sections) => sections.map((section) => section.id))).toEqual(["top", "experience", "capabilities", "about", "contact"]);
  await expect(page.locator("#about article")).toHaveCount(2);
});

test("mobile navigation closes after choosing a section", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Menu interaction belongs to the mobile viewport");
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await expect(menu).toHaveAttribute("aria-controls", "primary-nav");
  await menu.click();
  await expect(page.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Experience" }).click();
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#experience$/);
});

test("reveal content remains visible with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".reveal:not(.visible)")).toHaveCount(0);
  await expect(page.locator("#about h2")).toBeVisible();
});

test("reveal content remains visible without IntersectionObserver", async ({ page }) => {
  await page.addInitScript(() => { delete (window as unknown as Record<string, unknown>).IntersectionObserver; });
  await page.goto("/");
  await expect(page.locator(".reveal:not(.visible)")).toHaveCount(0);
  await expect(page.locator("#contact h2")).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("server content is visible before hydration", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#experience article")).toHaveCount(4);
    await expect(page.locator(".reveal:not(.visible)")).toHaveCount(0);
    await expect(page.locator("#contact h2")).toBeVisible();
  });
});
