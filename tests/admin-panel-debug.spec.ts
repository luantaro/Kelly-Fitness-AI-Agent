import { test, expect } from "@playwright/test";

test.describe("Admin Panel Debug", () => {
  test("should debug admin panel user loading", async ({ page }) => {
    console.log("🔍 Debugging admin panel user loading...");

    // Console logging
    page.on("console", (msg) => {
      console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
    });

    // Network logging
    page.on("response", (response) => {
      if (response.url().includes("/api/admin/users")) {
        console.log(
          `[NETWORK] API Response: ${response.url()} - Status: ${response.status()}`
        );
      }
    });

    page.on("requestfailed", (request) => {
      console.log(
        `[NETWORK FAILED] ${request.url()} - ${request.failure()?.errorText}`
      );
    });

    // Go to app and login as admin
    await page.goto("http://localhost:3002");
    await page.waitForLoadState("networkidle");

    const loginLink = page.locator('text="Đã có tài khoản? Đăng nhập"');
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();
      await page.waitForTimeout(1000);
    }

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', "admin@kelly-fitness.com");
    await page.fill('input[type="password"]', "AdminKellyFitness2025!");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    console.log("✅ Admin logged in");

    // Access admin panel
    const adminButton = page.locator('button:has-text("🔧 Admin")');
    if (await adminButton.isVisible({ timeout: 5000 })) {
      await adminButton.click();
      await page.waitForTimeout(5000); // Wait longer for data to load
      console.log("✅ Admin panel accessed");

      // Wait for potential API calls to complete
      await page.waitForTimeout(3000);

      // Debug: Check what's on the page
      const pageContent = await page.content();
      console.log("📄 Admin page loaded");

      // Look for various indicators of users being loaded
      const userTables = page.locator("table, .user-list, .user-grid");
      const userTableCount = await userTables.count();
      console.log(`📊 Found ${userTableCount} user display elements`);

      const userRows = page.locator("tr, .user-row, .user-card");
      const userRowCount = await userRows.count();
      console.log(`👥 Found ${userRowCount} potential user rows`);

      // Look for email patterns
      const emailElements = page.locator(
        "text=/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}/"
      );
      const emailCount = await emailElements.count();
      console.log(`📧 Found ${emailCount} email addresses on page`);

      if (emailCount > 0) {
        for (let i = 0; i < Math.min(emailCount, 5); i++) {
          const email = await emailElements.nth(i).textContent();
          console.log(`📧 Email ${i + 1}: ${email}`);
        }
      }

      // Look for buttons
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();
      console.log(`🔘 Found ${buttonCount} buttons on page`);

      // Check for specific text content
      const hasUserManagement = await page
        .locator('text*="User Management", text*="Quản lý người dùng"')
        .count();
      const hasLoadingText = await page
        .locator('text*="Loading", text*="Đang tải"')
        .count();
      const hasErrorText = await page
        .locator('text*="Error", text*="Lỗi"')
        .count();

      console.log(`📋 Has user management text: ${hasUserManagement > 0}`);
      console.log(`⏳ Has loading text: ${hasLoadingText > 0}`);
      console.log(`❌ Has error text: ${hasErrorText > 0}`);

      // Take a screenshot for debugging
      await page.screenshot({ path: "admin-panel-debug.png", fullPage: true });
      console.log("📸 Screenshot saved as admin-panel-debug.png");
    } else {
      console.log("❌ Admin button not found");
    }
  });
});
