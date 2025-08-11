import { test, expect } from "@playwright/test";

test.describe("Admin Access Debug", () => {
  test("should debug admin login and access", async ({ page }) => {
    console.log("🔍 Starting admin access debug...");

    // Listen to console logs
    page.on("console", (msg) => {
      console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
    });

    // Go to the app
    await page.goto("http://localhost:3002");
    await page.waitForLoadState("networkidle");

    console.log("📍 Current URL:", page.url());

    // Check if we're on signup page, click login link
    const loginLink = page.locator('text="Đã có tài khoản? Đăng nhập"');
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();
      await page.waitForTimeout(1000);
    }

    // Wait for login form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill admin credentials
    await page.fill('input[type="email"]', "admin@kelly-fitness.com");
    await page.fill('input[type="password"]', "AdminKellyFitness2025!");

    console.log("📧 Filled admin credentials");

    // Submit
    await page.click('button[type="submit"]');
    console.log("📤 Submitted login form");

    // Wait a bit
    await page.waitForTimeout(5000);

    console.log("📍 After login URL:", page.url());

    // Check if we can see admin button
    const adminButton = page.locator('button:has-text("🔧 Admin")');
    const isAdminButtonVisible = await adminButton.isVisible({ timeout: 5000 });
    console.log("🔧 Admin button visible:", isAdminButtonVisible);

    if (isAdminButtonVisible) {
      // Click admin button
      await adminButton.click();
      console.log("🔧 Clicked admin button");

      await page.waitForTimeout(3000);
      console.log("📍 After admin click URL:", page.url());

      // Check page content
      const pageText = await page.textContent("body");
      console.log(
        '📄 Page contains "admin":',
        pageText?.toLowerCase().includes("admin")
      );
      console.log(
        '📄 Page contains "không có quyền":',
        pageText?.includes("Không có quyền truy cập")
      );
      console.log(
        '📄 Page contains "xác thực":',
        pageText?.includes("Đang xác thực")
      );
    }

    // Try direct admin URL
    console.log("🔗 Trying direct admin URL...");
    await page.goto("http://localhost:3002/admin");
    await page.waitForTimeout(5000);

    console.log("📍 Direct admin URL:", page.url());
    const adminPageText = await page.textContent("body");
    console.log(
      '📄 Admin page contains "Không có quyền":',
      adminPageText?.includes("Không có quyền truy cập")
    );
    console.log(
      '📄 Admin page contains "Đang xác thực":',
      adminPageText?.includes("Đang xác thực")
    );
    console.log(
      "📄 Admin page contains user email:",
      adminPageText?.includes("admin@kelly-fitness.com")
    );

    // Take screenshot
    await page.screenshot({ path: "admin-debug.png", fullPage: true });
    console.log("📸 Screenshot saved as admin-debug.png");

    expect(true).toBe(true); // Always pass
  });
});
