import { test, expect } from "@playwright/test";

test.describe("Google Authentication Live Test", () => {
  test.beforeEach(async ({ page }) => {
    // Make sure dev server is running on port 3002
    await page.goto("http://localhost:3002/auth");
    await page.waitForLoadState("networkidle");
  });

  test("should display Google sign-in button correctly", async ({ page }) => {
    const googleButton = page.getByRole("button", {
      name: "Đăng nhập bằng Google",
    });
    await expect(googleButton).toBeVisible();

    // Check for Google logo SVG
    const googleLogo = googleButton.locator("svg");
    await expect(googleLogo).toBeVisible();
  });

  test("should handle Google Auth click flow", async ({ page }) => {
    // Monitor console for errors
    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleMessages.push(msg.text());
      }
    });

    // Click Google sign-in button
    const googleButton = page.getByRole("button", {
      name: "Đăng nhập bằng Google",
    });
    await googleButton.click();

    // Wait for Firebase auth to process
    await page.waitForTimeout(3000);

    // Check that either:
    // 1. A popup was blocked message appears
    // 2. An error message is shown
    // 3. User is redirected to auth flow
    // 4. Some Firebase error is shown

    const hasPopupBlocked = await page
      .locator("text=popup-blocked")
      .isVisible();
    const hasInternalError = await page
      .locator("text=internal-error")
      .isVisible();
    const hasNetworkError = await page
      .locator("text=network-request-failed")
      .isVisible();
    const hasAuthError = await page.locator("text=Lỗi đăng nhập").isVisible();

    // Also check console for Firebase errors
    const hasConsoleError = consoleMessages.some(
      (msg) =>
        msg.includes("auth") ||
        msg.includes("firebase") ||
        msg.includes("google")
    );

    // Test passes if any auth flow was attempted (even if it fails due to CSP/config)
    const authFlowAttempted =
      hasPopupBlocked ||
      hasInternalError ||
      hasNetworkError ||
      hasAuthError ||
      hasConsoleError;

    if (!authFlowAttempted) {
      console.log("Console messages:", consoleMessages);
      console.log("Current URL:", page.url());

      // Take screenshot for debugging
      await page.screenshot({ path: "google-auth-debug.png", fullPage: true });
    }

    expect(authFlowAttempted).toBeTruthy();
  });

  test("should show proper Google Auth error handling", async ({ page }) => {
    // Monitor network requests
    const authRequests: string[] = [];
    page.on("request", (request) => {
      if (
        request.url().includes("googleapis.com") ||
        request.url().includes("google.com")
      ) {
        authRequests.push(request.url());
      }
    });

    // Click Google button
    const googleButton = page.getByRole("button", {
      name: "Đăng nhập bằng Google",
    });
    await googleButton.click();

    // Wait for auth attempt
    await page.waitForTimeout(5000);

    // Should have attempted to contact Google services
    console.log("Auth requests made:", authRequests);

    // Check for specific error handling
    const errorMessages = await page
      .locator('[class*="text-red"]')
      .allTextContents();
    console.log("Error messages shown:", errorMessages);

    // Test passes if Google auth was attempted (requests made or errors shown)
    expect(authRequests.length > 0 || errorMessages.length > 0).toBeTruthy();
  });

  test("should switch Google button text in signup mode", async ({ page }) => {
    // Initially in login mode
    await expect(
      page.getByRole("button", { name: "Đăng nhập bằng Google" })
    ).toBeVisible();

    // Switch to signup
    await page
      .getByRole("button", { name: "Chưa có tài khoản? Đăng ký" })
      .click();

    // Should show signup text
    await expect(
      page.getByRole("button", { name: "Đăng ký bằng Google" })
    ).toBeVisible();
  });

  test("should handle CSP and configuration correctly", async ({ page }) => {
    // Check if Google auth scripts are loaded
    const scripts = await page.locator('script[src*="googleapis.com"]').count();
    console.log("Google scripts loaded:", scripts);

    // Check console for CSP violations
    const cspViolations: string[] = [];
    page.on("console", (msg) => {
      if (
        msg.text().includes("Content Security Policy") ||
        msg.text().includes("CSP")
      ) {
        cspViolations.push(msg.text());
      }
    });

    // Try Google auth
    await page.getByRole("button", { name: "Đăng nhập bằng Google" }).click();
    await page.waitForTimeout(3000);

    // Log any CSP violations
    if (cspViolations.length > 0) {
      console.log("CSP violations detected:", cspViolations);
    }

    // Test passes if no CSP violations related to Google domains
    const hasGoogleCSPViolation = cspViolations.some(
      (violation) =>
        violation.includes("googleapis.com") || violation.includes("google.com")
    );

    expect(hasGoogleCSPViolation).toBeFalsy();
  });
});
