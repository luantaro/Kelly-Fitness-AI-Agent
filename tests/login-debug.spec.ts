import { test, expect } from "@playwright/test";

test.describe("Detailed Login Debug", () => {
  test("should debug the complete login flow", async ({ page }) => {
    console.log("=== Starting login debug ===");

    // Go to homepage
    await page.goto("http://localhost:3001");
    await page.waitForLoadState("networkidle");

    console.log("1. Homepage loaded");
    await page.screenshot({
      path: "test-results/debug-step-1-homepage.png",
      fullPage: true,
    });

    // Click login link if on signup page
    const loginLink = page.locator('text="Đã có tài khoản? Đăng nhập"');
    if (await loginLink.isVisible({ timeout: 2000 })) {
      console.log("2. Found signup page, clicking login link");
      await loginLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: "test-results/debug-step-2-clicked-login.png",
        fullPage: true,
      });
    } else {
      console.log("2. Already on login page or different page");
    }

    // Fill email
    console.log("3. Filling email");
    await page.fill('input[type="email"]', "freeuser1@test.com");
    await page.screenshot({
      path: "test-results/debug-step-3-email-filled.png",
      fullPage: true,
    });

    // Fill password
    console.log("4. Filling password");
    await page.fill('input[type="password"]', "Test123456");
    await page.screenshot({
      path: "test-results/debug-step-4-password-filled.png",
      fullPage: true,
    });

    // Submit form
    console.log("5. Submitting form");
    await page.click('button[type="submit"]');

    // Wait and see what happens
    console.log("6. Waiting for response...");
    await page.waitForTimeout(5000);
    await page.screenshot({
      path: "test-results/debug-step-6-after-submit.png",
      fullPage: true,
    });

    // Check URL
    const currentUrl = page.url();
    console.log("7. Current URL:", currentUrl);

    // Check for any error messages
    const errorSelectors = [
      ".error",
      '[class*="error"]',
      'text="Invalid"',
      'text="Error"',
      'text="Lỗi"',
      '[data-testid="error"]',
    ];

    for (const selector of errorSelectors) {
      if (await page.isVisible(selector, { timeout: 1000 })) {
        const errorText = await page.textContent(selector);
        console.log(`8. Found error: ${errorText}`);
      }
    }

    // Check if we're still on login/signup page
    const stillOnAuthPage = await page.isVisible('input[type="email"]', {
      timeout: 2000,
    });
    console.log("9. Still on auth page:", stillOnAuthPage);

    // Look for main interface elements
    const mainInterfaceElements = [
      'text="Trợ lý AI"',
      'text="Chat"',
      '[data-testid="chat-interface"]',
      'button:has-text("⚙️")',
      ".sidebar",
    ];

    console.log("10. Checking for main interface elements:");
    for (const selector of mainInterfaceElements) {
      const isVisible = await page.isVisible(selector, { timeout: 1000 });
      console.log(`    - ${selector}: ${isVisible}`);
    }

    // Get all button texts on current page
    const buttons = await page.locator("button").all();
    console.log("11. Current buttons:");
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.trim()) {
        console.log(`    - "${text.trim()}"`);
      }
    }

    console.log("=== Login debug completed ===");
  });
});
