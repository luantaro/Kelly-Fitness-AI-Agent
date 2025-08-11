import { test, expect } from "@playwright/test";

test.describe("UI Flow Debug", () => {
  test("should debug signup to login form transition", async ({ page }) => {
    console.log("=== Debug UI Form Transition ===");

    // Go to homepage
    await page.goto("http://localhost:3001");
    await page.waitForLoadState("networkidle");

    console.log("1. Homepage loaded");
    await page.screenshot({
      path: "test-results/ui-debug-step-1-homepage.png",
      fullPage: true,
    });

    // Check what's on the page initially
    const pageText = await page.textContent("body");
    console.log("2. Page contains:");
    console.log('   - "Tạo tài khoản":', pageText?.includes("Tạo tài khoản"));
    console.log(
      '   - "Đã có tài khoản":',
      pageText?.includes("Đã có tài khoản")
    );
    console.log('   - "Đăng nhập":', pageText?.includes("Đăng nhập"));

    // Look for the login link
    const loginLinkSelectors = [
      'text="Đã có tài khoản? Đăng nhập"',
      'a:has-text("Đăng nhập")',
      'button:has-text("Đăng nhập")',
      '[href*="login"]',
      ".login-link",
    ];

    let loginLinkFound = false;
    let usedSelector = "";

    for (const selector of loginLinkSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`3. Found login link with selector: ${selector}`);
          usedSelector = selector;
          loginLinkFound = true;

          // Get the exact text and attributes
          const text = await element.textContent();
          const tagName = await element.evaluate((el) => el.tagName);
          const className = await element.getAttribute("class");
          const href = await element.getAttribute("href");

          console.log(`   - Text: "${text}"`);
          console.log(`   - Tag: ${tagName}`);
          console.log(`   - Class: ${className}`);
          console.log(`   - Href: ${href}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!loginLinkFound) {
      console.log("3. ❌ No login link found");

      // Let's see all clickable elements with text containing "đăng nhập"
      const allElements = await page
        .locator('*:has-text("đăng nhập"), *:has-text("Đăng nhập")')
        .all();
      console.log(
        `Found ${allElements.length} elements with "đăng nhập" text:`
      );

      for (const element of allElements) {
        const tagName = await element.evaluate((el) => el.tagName);
        const text = await element.textContent();
        const isVisible = await element.isVisible();
        console.log(`   - ${tagName}: "${text}" (visible: ${isVisible})`);
      }
      return;
    }

    // Click the login link
    console.log("4. Clicking login link...");
    await page.locator(usedSelector).click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: "test-results/ui-debug-step-2-clicked-login.png",
      fullPage: true,
    });

    // Check what changed
    const newPageText = await page.textContent("body");
    console.log("5. After clicking login link:");
    console.log(
      '   - "Tạo tài khoản":',
      newPageText?.includes("Tạo tài khoản")
    );
    console.log('   - "Đăng nhập":', newPageText?.includes("Đăng nhập"));
    console.log("   - Page URL:", page.url());

    // Check what form elements are now visible
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    console.log("6. Form elements after transition:");
    console.log(
      "   - Email input visible:",
      await emailInput.isVisible({ timeout: 1000 })
    );
    console.log(
      "   - Password input visible:",
      await passwordInput.isVisible({ timeout: 1000 })
    );
    console.log(
      "   - Submit button visible:",
      await submitButton.isVisible({ timeout: 1000 })
    );

    if (await submitButton.isVisible({ timeout: 1000 })) {
      const submitText = await submitButton.textContent();
      console.log(`   - Submit button text: "${submitText}"`);
    }

    // Check for any toggle between signup/login
    const toggleElements = await page
      .locator('*:has-text("Tạo tài khoản"), *:has-text("Đăng ký")')
      .all();
    console.log(
      `7. Found ${toggleElements.length} elements that might toggle back to signup:`
    );
    for (const element of toggleElements) {
      const text = await element.textContent();
      const isVisible = await element.isVisible();
      console.log(`   - "${text}" (visible: ${isVisible})`);
    }

    console.log("=== UI Debug Completed ===");
  });
});
