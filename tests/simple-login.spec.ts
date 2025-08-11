import { test, expect } from "@playwright/test";
import { AuthHelper } from "./helpers";

test.describe("Simple Login Test", () => {
  test("should allow user login and show main interface", async ({ page }) => {
    const authHelper = new AuthHelper(page);

    // Try to login
    await authHelper.loginAsUser();

    // Verify we're logged in
    const isLoggedIn = await authHelper.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Take screenshot to see what we got
    await page.screenshot({
      path: "test-results/successful-login.png",
      fullPage: true,
    });

    console.log("✅ Login test passed");
  });
});
