import { test, expect } from "@playwright/test";
import { AuthHelper } from "./helpers";
import { TestUsers } from "./test-utils";

test.describe("Smoke Tests", () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    // Navigate to homepage first, then clear session
    await page.goto("/");
    await authHelper.clearSession();
  });

  test("should load homepage", async ({ page }) => {
    await page.goto("/");

    // Should see login form or main interface
    const hasLoginForm = await page.isVisible('input[type="email"]', {
      timeout: 5000,
    });
    const hasMainInterface = await page.isVisible(
      '[data-testid="sidebar"], .sidebar',
      { timeout: 2000 }
    );

    expect(hasLoginForm || hasMainInterface).toBe(true);
    console.log("✅ Homepage loads successfully");
  });

  test("should allow user login", async ({ page }) => {
    await authHelper.loginAsUser();

    // Should see main interface after login
    const isLoggedIn = await authHelper.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    console.log("✅ User login works");
  });

  test("should allow admin login", async ({ page }) => {
    await authHelper.loginAsAdmin();

    // Should see admin interface
    const isAdmin = await authHelper.isAdmin();
    expect(isAdmin).toBe(true);

    console.log("✅ Admin login works");
  });

  test("should show settings modal", async ({ page }) => {
    await authHelper.loginAsUser();

    // Click settings button
    await page.click(
      'button[title*="Settings"], button:has([data-icon="settings"]), [data-testid="settings-button"]'
    );

    // Should see settings modal
    const hasSettingsModal = await page.isVisible(
      'input[placeholder*="tên"], input[placeholder*="name"]',
      { timeout: 5000 }
    );
    expect(hasSettingsModal).toBe(true);

    console.log("✅ Settings modal opens");
  });

  test("should navigate to admin dashboard", async ({ page }) => {
    await authHelper.loginAsAdmin();

    // Click admin button
    await page.click('button:has-text("Admin"), [data-testid="admin-button"]');

    // Should see admin dashboard
    const hasAdminDashboard = await page.isVisible(
      'table, [data-testid="user-table"]',
      { timeout: 10000 }
    );
    expect(hasAdminDashboard).toBe(true);

    console.log("✅ Admin dashboard accessible");
  });

  test("should handle logout", async ({ page }) => {
    await authHelper.loginAsUser();
    await authHelper.logout();

    // Should see login form again
    const hasLoginForm = await page.isVisible('input[type="email"]', {
      timeout: 5000,
    });
    expect(hasLoginForm).toBe(true);

    console.log("✅ Logout works");
  });

  test.afterEach(async ({ page }) => {
    try {
      await authHelper.logout();
    } catch (error) {
      console.log("Logout failed, continuing with cleanup");
    }
    await authHelper.clearSession();
  });
});
