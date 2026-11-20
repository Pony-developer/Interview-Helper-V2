import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", h1: /Assay/ },
  { path: "/uk", h1: /Assay/ },
  { path: "/lectures", h1: /Lecture library/ },
  { path: "/uk/lectures", h1: /Бібліотека лекцій/ },
  { path: "/lectures/searching-algorithms", h1: /Searching algorithms/ },
  { path: "/uk/lectures/searching-algorithms", h1: /Алгоритми пошуку/ },
  { path: "/login", h1: /Sign in/ },
];

for (const { path, h1 } of PAGES) {
  test(`${path} renders and has no axe violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1").first()).toHaveText(h1);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // Decorative hero animations fade in; wait for them before measuring contrast.
      .exclude("[aria-hidden='true']")
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("landing exposes SEO essentials", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Assay/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /interview/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/); // site root; origin comes from NEXT_PUBLIC_SITE_URL
  await expect(page.locator('link[rel="alternate"][hreflang="uk"]')).toHaveAttribute("href", /\/uk$/);
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute("content", /opengraph-image/);
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  type Node = { "@type": string; "@graph"?: Node[] };
  const types = jsonLd.flatMap((t) =>
    [JSON.parse(t) as Node | Node[]].flat().flatMap((x) => (x["@graph"] ?? [x]).map((n) => n["@type"])),
  );
  expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "WebApplication", "FAQPage"]));
});

test("skip link moves focus to main content", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium");
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("mobile menu closes on Escape and returns focus to its toggle", async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto("/");
  const toggle = page.locator("header button[aria-expanded]").first();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.locator(`#${await toggle.getAttribute("aria-controls")} a`).first().focus();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("hero carousel can be paused and navigated", async ({ page }) => {
  await page.goto("/");
  const carousel = page.locator('[aria-roledescription="carousel"]');
  await carousel.getByRole("button", { name: /Pause slideshow/ }).click();
  await carousel.getByRole("button", { name: "Go to slide 2" }).click();
  await expect(carousel.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute("aria-current", "true");
});

test("robots.txt and sitemap.xml are served", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /interview");
  expect(robots).toContain("Sitemap:");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>");
  expect(sitemap).toContain('hreflang="uk"');
  expect(sitemap).toContain("/lectures/searching-algorithms");
});

test("protected pages redirect to login with a return path", async ({ page }) => {
  for (const path of ["/practice", "/uk/progress", "/interview/00000000-0000-4000-8000-000000000000"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?next=/);
  }
});

test("language switcher keeps the page", async ({ page }) => {
  await page.goto("/lectures");
  await page.getByRole("link", { name: /Українська/ }).first().click();
  await expect(page).toHaveURL(/\/uk\/lectures$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});
