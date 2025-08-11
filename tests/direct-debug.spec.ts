import { test, expect } from "@playwright/test";

test.describe("Direct Login Debug", () => {
  test("should test login and check specific elements", async ({ page }) => {
    console.log("=== Direct Login Debug ===");

    // Navigate and login
    await page.goto("http://localhost:3001");
    await page.waitForLoadState("networkidle");

    // Click login link if needed
    const loginLink = page.locator('button:has-text("Đăng nhập")');
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();
      await page.waitForTimeout(2000);
    }

    // Fill and submit
    await page.fill('input[type="email"]', "freeuser1@test.com");
    await page.fill('input[type="password"]', "test123456");
    await page.click('button[type="submit"]');

    // Wait
    await page.waitForTimeout(8000);

    // Screenshot after login
    await page.screenshot({
      path: "test-results/direct-debug-after-login.png",
      fullPage: true,
    });

    // Check each selector individually
    const selectorsToCheck = [
      'button:has-text("✨ Cuộc trò chuyện mới")',
      'button:has-text("🤖 AI Agent")',
      'button:has-text("Cài đặt")',
      'button:has-text("Thoát")',
      'text="Trợ lý AI"',
      '[data-testid="chat-interface"]',
      ".sidebar",
    ];

    console.log("Checking selectors:");
    for (const selector of selectorsToCheck) {
      const isVisible = await page.isVisible(selector, { timeout: 1000 });
      console.log(`  - "${selector}": ${isVisible}`);
    }

    // Check what buttons are actually visible
    const allButtons = await page.locator("button:visible").all();
    console.log("\nAll visible buttons:");
    for (const button of allButtons) {
      const text = await button.textContent();
      if (text && text.trim()) {
        console.log(`  - "${text.trim()}"`);
      }
    }

    // Check if the main chat button exists with exact text
    const newChatButton = page.locator('text="✨ Cuộc trò chuyện mới"');
    const newChatVisible = await newChatButton.isVisible({ timeout: 1000 });
    console.log(`\nExact text "✨ Cuộc trò chuyện mới": ${newChatVisible}`);

    // Try alternative selectors
    const altSelectors = [
      'text*="Cuộc trò chuyện"',
      'text*="trò chuyện"',
      '*:has-text("✨")',
      'button:has-text("Cuộc trò chuyện")',
    ];

    console.log("\nAlternative selectors:");
    for (const selector of altSelectors) {
      const isVisible = await page.isVisible(selector, { timeout: 1000 });
      console.log(`  - "${selector}": ${isVisible}`);
    }

    console.log("=== Debug Complete ===");
  });
});
