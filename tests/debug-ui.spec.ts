import { test, expect } from "@playwright/test";
import { UIStabilityHelper, EnhancedAuthHelper } from "./stability-helpers";

test.describe("Debug UI Elements Test", () => {
  test("should debug UI elements after login", async ({ page }) => {
    console.log("🔍 Debugging UI elements after login...");

    const stability = new UIStabilityHelper(page);

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`❌ Browser error: ${msg.text()}`);
      }
    });

    // Listen for page errors
    page.on("pageerror", (error) => {
      console.log(`❌ Page error: ${error.message}`);
    });

    try {
      // Login manually first
      await page.goto("http://localhost:3002");
      await page.waitForLoadState("networkidle");

      console.log(`📍 Initial URL: ${page.url()}`);

      // Check if on signup page, click login
      const loginLink = page.locator('text="Đã có tài khoản? Đăng nhập"');
      if (await loginLink.isVisible({ timeout: 2000 })) {
        await loginLink.click();
        await page.waitForTimeout(1000);
        console.log("✅ Clicked login link");
      }

      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      console.log("📧 Filling email...");
      await page.fill('input[type="email"]', "admin@kelly-fitness.com");

      console.log("🔒 Filling password...");
      await page.fill('input[type="password"]', "AdminKellyFitness2025!");

      console.log("🔄 Clicking submit...");
      await page.click('button[type="submit"]');

      // Wait and check for navigation or errors
      await page.waitForTimeout(3000);
      console.log(`📍 URL after submit: ${page.url()}`);

      // Look for any error messages
      const errorElements = [
        ".error",
        '[class*="error"]',
        'div:has-text("Sai")',
        'div:has-text("Lỗi")',
        'div:has-text("Error")',
        'div:has-text("Invalid")',
      ];

      for (const selector of errorElements) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 1000 })) {
            const text = await element.textContent();
            console.log(`⚠️ Error message found: "${text}"`);
          }
        } catch (error) {
          // Continue checking
        }
      }

      // Wait more time for potential redirect
      await page.waitForTimeout(5000);
      console.log(`📍 Final URL: ${page.url()}`);

      console.log("✅ Manual login completed");

      // Debug: Take screenshot
      await page.screenshot({ path: "debug-after-login.png", fullPage: true });

      // Debug: Check what elements exist
      console.log("\n🔍 Debugging sidebar elements:");

      // Check all possible sidebar selectors
      const sidebarSelectors = [
        '[data-testid="sidebar-user-name"]',
        '[data-testid="settings-button"]',
        '[data-testid="logout-button"]',
        '[data-testid="admin-button"]',
        'button[title="Cuộc trò chuyện mới"]',
        'button:has-text("⚙️")',
        'button:has-text("Cài đặt")',
        'button:has-text("Đăng xuất")',
        ".sidebar",
        "nav",
        "aside",
      ];

      for (const selector of sidebarSelectors) {
        try {
          const element = page.locator(selector);
          const count = await element.count();
          const isVisible =
            count > 0 ? await element.first().isVisible() : false;

          console.log(
            `${selector}: ${count} elements found, visible: ${isVisible}`
          );

          if (count > 0 && isVisible) {
            const textContent = await element.first().textContent();
            console.log(`  Text content: "${textContent}"`);
          }
        } catch (error) {
          console.log(`${selector}: ERROR - ${error}`);
        }
      }

      // Debug: Get page HTML around sidebar area
      console.log("\n🔍 Page structure debugging:");

      // Look for common layout elements
      const layoutSelectors = [
        "body",
        "main",
        ".sidebar",
        '[class*="sidebar"]',
        '[class*="navigation"]',
        '[class*="menu"]',
      ];

      for (const selector of layoutSelectors) {
        try {
          const element = page.locator(selector);
          const count = await element.count();
          if (count > 0) {
            const classList = await element.first().getAttribute("class");
            console.log(`${selector}: found, classes: ${classList || "none"}`);
          }
        } catch (error) {
          console.log(`${selector}: not found`);
        }
      }

      // Debug: Check if we're on the right page
      const currentUrl = page.url();
      console.log(`\n🔍 Current URL: ${currentUrl}`);

      // Debug: Look for any button elements
      console.log("\n🔍 All button elements:");
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();
      console.log(`Found ${buttonCount} button elements:`);

      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        try {
          const button = buttons.nth(i);
          const text = await button.textContent();
          const classes = await button.getAttribute("class");
          const testId = await button.getAttribute("data-testid");
          console.log(
            `  Button ${i}: "${text}" (classes: ${classes}, testid: ${testId})`
          );
        } catch (error) {
          console.log(`  Button ${i}: Error reading properties`);
        }
      }

      console.log(
        "\n🎯 DEBUG COMPLETE - Check debug-after-login.png for visual state"
      );
    } catch (error: any) {
      console.error("❌ Debug test failed:", error.message);
      throw error;
    }
  });
});
