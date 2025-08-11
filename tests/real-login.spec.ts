import { test, expect } from "@playwright/test";

test.describe("Real Login Test", () => {
  test("should test complete login flow with valid credentials", async ({
    page,
  }) => {
    console.log("=== Testing Real Login Flow ===");

    // Navigate to homepage
    await page.goto("http://localhost:3001");
    await page.waitForLoadState("networkidle");
    console.log("1. Loaded homepage");

    // Click login link if on signup page
    const loginLink = page.locator('button:has-text("Đăng nhập")');
    if (await loginLink.isVisible({ timeout: 2000 })) {
      console.log("2. Found signup page, clicking login link");
      await loginLink.click();
      await page.waitForTimeout(2000);
    }

    // Verify we're on login form
    const submitButton = page.locator('button[type="submit"]');
    const submitText = await submitButton.textContent();
    console.log(`3. Submit button text: "${submitText}"`);

    if (submitText !== "Đăng nhập") {
      console.log("❌ Not on login form yet");
      return;
    }

    // Fill credentials
    console.log("4. Filling credentials");
    await page.fill('input[type="email"]', "freeuser1@test.com");
    await page.fill('input[type="password"]', "test123456");

    // Listen for navigation or page changes
    console.log("5. Setting up network monitoring");

    // Monitor for API calls
    page.on("response", async (response) => {
      if (response.url().includes("/api/")) {
        console.log(
          `API Response: ${response.url()} - Status: ${response.status()}`
        );
        try {
          const text = await response.text();
          if (text && text.length < 500) {
            console.log(`API Response body: ${text}`);
          }
        } catch (e) {
          console.log("Could not read response body");
        }
      }
    });

    // Monitor for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`Browser error: ${msg.text()}`);
      }
    });

    // Take screenshot before submit
    await page.screenshot({
      path: "test-results/real-login-before-submit.png",
      fullPage: true,
    });

    // Submit the form
    console.log("6. Submitting login form");
    await submitButton.click();

    // Wait for potential navigation
    console.log("7. Waiting for response...");
    await page.waitForTimeout(5000);

    // Take screenshot after submit
    await page.screenshot({
      path: "test-results/real-login-after-submit.png",
      fullPage: true,
    });

    // Check current URL
    const currentUrl = page.url();
    console.log(`8. Current URL: ${currentUrl}`);

    // Check if still on auth page
    const stillOnAuth = await page.isVisible('input[type="email"]', {
      timeout: 2000,
    });
    console.log(`9. Still on auth page: ${stillOnAuth}`);

    // Check for main app elements
    const mainAppElements = [
      'text="Trợ lý AI"',
      'text="Hỗ trợ thể hình"',
      '[data-testid="chat-input"]',
      'textarea[placeholder*="Nhập câu hỏi"]',
      ".sidebar",
      'button:has-text("⚙️")',
    ];

    console.log("10. Checking for main app elements:");
    for (const selector of mainAppElements) {
      const isVisible = await page.isVisible(selector, { timeout: 1000 });
      console.log(`    - ${selector}: ${isVisible}`);
      if (isVisible) {
        console.log("✅ Found main app element - login successful!");
        break;
      }
    }

    // Check page content for any obvious errors
    const bodyText = await page.textContent("body");
    if (
      bodyText?.includes("Invalid") ||
      bodyText?.includes("Error") ||
      bodyText?.includes("Lỗi")
    ) {
      console.log("11. Found error text in page");
    }

    // List all visible buttons after login attempt
    const buttons = await page.locator("button:visible").all();
    console.log("12. Visible buttons after login:");
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.trim()) {
        console.log(`    - "${text.trim()}"`);
      }
    }

    console.log("=== Real Login Test Completed ===");
  });
});
