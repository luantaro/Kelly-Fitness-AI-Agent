import { test, expect } from "@playwright/test";

test.describe("Google Auth Debug Test", () => {
  test("should test Google Auth click with COOP headers", async ({ page }) => {
    // Go to auth page
    await page.goto("http://localhost:3002/auth");
    await page.waitForLoadState("networkidle");

    // Monitor console for errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Monitor network for blocked requests
    const blockedRequests: string[] = [];
    page.on("requestfailed", (request) => {
      blockedRequests.push(
        `${request.method()} ${request.url()} - ${request.failure()?.errorText}`
      );
    });

    // Take initial screenshot
    await page.screenshot({ path: "test-results/google-auth-before.png" });

    // Click Google Auth button
    const googleButton = page.getByRole("button", {
      name: "Đăng nhập bằng Google",
    });
    await expect(googleButton).toBeVisible();

    console.log("Clicking Google Auth button...");
    await googleButton.click();

    // Wait for auth flow to start
    await page.waitForTimeout(3000);

    // Take screenshot after click
    await page.screenshot({ path: "test-results/google-auth-after.png" });

    // Log all errors and blocked requests
    console.log("Console Errors:", errors);
    console.log("Blocked Requests:", blockedRequests);

    // Check for specific CORS/COOP errors
    const hasCOOPError = errors.some(
      (error) =>
        error.includes("Cross-Origin-Opener-Policy") || error.includes("COOP")
    );

    const hasCORSError = errors.some(
      (error) => error.includes("CORS") || error.includes("cross-origin")
    );

    const hasAuthError = errors.some(
      (error) =>
        error.includes("auth") ||
        error.includes("firebase") ||
        error.includes("popup")
    );

    console.log("COOP Error:", hasCOOPError);
    console.log("CORS Error:", hasCORSError);
    console.log("Auth Error:", hasAuthError);

    // Test passes if no COOP errors (main issue we're fixing)
    expect(hasCOOPError).toBeFalsy();
  });

  test("should check response headers include COOP", async ({ page }) => {
    // Intercept the main page response to check headers
    let responseHeaders: Record<string, string> = {};

    page.on("response", (response) => {
      if (response.url().includes("localhost:3002/auth")) {
        responseHeaders = response.headers();
      }
    });

    await page.goto("http://localhost:3002/auth");
    await page.waitForLoadState("networkidle");

    console.log("Response Headers:", responseHeaders);

    // Check that COOP header is present
    const coopHeader = responseHeaders["cross-origin-opener-policy"];
    console.log("COOP Header:", coopHeader);

    expect(coopHeader).toBe("same-origin-allow-popups");
  });
});
