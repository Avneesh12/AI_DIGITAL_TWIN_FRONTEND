/**
 * tests/e2e/auth-flow.spec.ts
 * Playwright end-to-end tests for the auth + chat flow.
 *
 * Run:  npx playwright test
 * Requires: a running frontend (npm run dev) and backend (uvicorn)
 */
import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:3000";
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_USER  = `user_${Date.now()}`;
const TEST_PASS  = "testpassword123";

test.describe("Authentication Flow", () => {
  test("registers a new user and lands on chat", async ({ page }) => {
    await page.goto(`${BASE}/register`);

    await page.fill('input[name="username"]', TEST_USER);
    await page.fill('input[name="email"]',    TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASS);
    await page.click('button[type="submit"]');

    // Should land on dashboard/chat after registration
    await expect(page).toHaveURL(/\/dashboard\/chat/);
    await expect(page.locator("text=New conversation")).toBeVisible();
  });

  test("shows validation error for short password", async ({ page }) => {
    await page.goto(`${BASE}/register`);

    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]',    "x@x.com");
    await page.fill('input[name="password"]', "short");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=At least 8 characters")).toBeVisible();
  });

  test("login with valid credentials", async ({ page }) => {
    await page.goto(`${BASE}/login`);

    await page.fill('input[type="email"]',    TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard\/chat/);
  });

  test("redirects unauthenticated users from dashboard", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/chat`);
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Chat Flow", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // Login first
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]',    TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/chat/);
  });

  test.afterEach(async () => { await page.close(); });

  test("can send a message and receive a response", async () => {
    await page.fill("textarea", "What are my core values?");
    await page.keyboard.press("Enter");

    // Typing indicator should appear
    await expect(page.locator(".typing-dot").first()).toBeVisible({ timeout: 3000 });

    // Response should appear within 30s (LLM latency)
    await expect(
      page.locator('[class*="rounded-2xl rounded-tl-sm"]').last()
    ).toBeVisible({ timeout: 30_000 });
  });

  test("sidebar navigation works", async () => {
    await page.click("text=Memory");
    await expect(page).toHaveURL(/\/dashboard\/memory/);
    await expect(page.locator("text=Memory Bank")).toBeVisible();

    await page.click("text=Personality");
    await expect(page).toHaveURL(/\/dashboard\/personality/);
    await expect(page.locator("text=Personality Profile")).toBeVisible();
  });
});

test.describe("Personality Flow", () => {
  test("can update personality profile", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]',    TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/chat/);

    await page.goto(`${BASE}/dashboard/personality`);
    await expect(page.locator("text=Personality Profile")).toBeVisible();

    // Select a tone chip
    await page.click("text=casual");

    // Save
    await page.click("text=Save Profile");
    await expect(page.locator("text=Personality profile updated")).toBeVisible({ timeout: 10_000 });
  });
});
