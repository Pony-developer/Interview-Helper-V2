---
skill: playwright
title: "End-to-end testing with Playwright"
summary: "What E2E tests are for and how many to write, Playwright's architecture and auto-waiting, user-facing locators and web-first assertions, fixtures, authentication state, network mocking, avoiding flaky tests, parallel runs, traces and CI, plus visual and accessibility checks."
readingMinutes: 8
---

End-to-end (E2E) tests drive a real browser through your real app, the way a user would: open the page, type, click, and check what appears. They catch problems unit tests can't (routing, real CSS, integration between frontend and backend), but they're slower and more brittle, so keep them for **critical user journeys**: sign-up, checkout, the main workflow. The testing pyramid (or "trophy") puts most tests at the unit/integration level and a thin layer of E2E on top.

## Why Playwright

Playwright controls Chromium, Firefox and WebKit through one API, runs tests in parallel in isolated **browser contexts** (fresh cookies and storage per test, much cheaper than new browsers), and **auto-waits**: actions wait for the element to be visible, enabled and stable, and assertions retry until they pass or time out. That removes most `sleep` calls, the classic source of flakiness.

```ts
import { expect, test } from "@playwright/test";

test("user can add a todo", async ({ page }) => {
  await page.goto("/todos");
  await page.getByLabel("New todo").fill("Buy milk");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByRole("listitem")).toHaveText(["Buy milk"]);
});
```

## Locators: query like a user

Prefer locators based on what users perceive, in this order:

1. `getByRole("button", { name: "Save" })`: also checks accessibility (the element must have the right role and name).
2. `getByLabel("Email")`, `getByPlaceholder`, `getByText`, `getByAltText`.
3. `getByTestId("cart-total")` when nothing user-facing is stable.
4. CSS/XPath selectors only as a last resort; they break when markup changes.

Locators are lazy and strict: they're resolved at action time, and an action fails if the locator matches several elements, which surfaces ambiguous selectors early. Narrow with `.filter({ hasText })` or by chaining from a container.

## Web-first assertions

Use `await expect(locator).toBeVisible()`, `toHaveText`, `toHaveValue`, `toHaveURL`, `toHaveCount`: they **retry** until the condition holds. Avoid reading a value once and asserting on it (`expect(await el.textContent()).toBe(…)`), which doesn't wait and causes flakiness.

## Fixtures, auth and test data

- **Fixtures** (`test.extend`) provide reusable setup: a logged-in page, a seeded database, a page object.
- **Authentication**: log in once in a setup project, save `storageState` (cookies and local storage) to a file, and reuse it in every test instead of going through the login form each time.
- **Test data**: create what each test needs through the API or database, with unique names, so tests are independent and can run in parallel. Never rely on test order.

## Network control

```ts
await page.route("**/api/recommendations", (route) => route.fulfill({ json: [] }));
```

`page.route` can mock, modify or block requests, which is useful for error states ("server returns 500"), slow responses, or flaky third-party services. Keep a few tests that hit the real backend so mocks don't drift from reality.

## Flakiness checklist

- No fixed `waitForTimeout`; wait for a visible state instead.
- Isolated data per test; reset state in fixtures.
- Disable animations or use `reducedMotion` for stability.
- Don't assert on things that legitimately vary (timestamps, random IDs); mask them in screenshots.
- Use **retries** in CI only as a safety net, and treat a "flaky" label as a bug to fix.

## Debugging and CI

- `npx playwright test --ui` or `--debug` to step through; `codegen` records interactions into code.
- **Traces** (`trace: "on-first-retry"`) capture DOM snapshots, network, console and screenshots for every step, the fastest way to debug CI failures.
- Run sharded and in parallel in CI, against a production-like build (`webServer` in the config can start it).

## Beyond functional checks

- **Visual regression**: `await expect(page).toHaveScreenshot()` compares against a stored baseline (pin OS and fonts in CI to avoid noise).
- **Accessibility**: run `@axe-core/playwright` on key pages to catch missing labels, contrast problems and ARIA errors.
- **Component testing** is available too, but most teams use Vitest + Testing Library for components and Playwright for full flows.

## Interview checklist

- Explain what to cover with E2E vs unit/integration tests.
- Explain auto-waiting and web-first assertions and why they reduce flakiness.
- Choose good locators and explain why role-based ones are preferred.
- Describe reusing authentication state and isolating test data.
- Describe how to debug a test that fails only in CI (traces, retries, screenshots).
