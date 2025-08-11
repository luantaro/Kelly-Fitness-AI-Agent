import { test, expect } from "@playwright/test";

test.describe("Debug Selectors", () => {
  test("should identify all major UI elements", async ({ page }) => {
    console.log("🔍 Starting selector debug test...");

    // Go to the app
    await page.goto("http://localhost:3002");
    await page.waitForLoadState("networkidle");

    console.log("📍 Current URL:", page.url());

    // Check for auth form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    console.log("📧 Email input visible:", await emailInput.isVisible());
    console.log("🔒 Password input visible:", await passwordInput.isVisible());
    console.log("📤 Submit button visible:", await submitButton.isVisible());

    // Check page title and content
    const title = await page.title();
    console.log("📄 Page title:", title);

    // Log all buttons found
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    console.log("🔘 Total buttons found:", buttonCount);

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const buttonText = await buttons.nth(i).textContent();
      const buttonTitle = await buttons.nth(i).getAttribute("title");
      console.log(`Button ${i}: "${buttonText}" title="${buttonTitle}"`);
    }

    // Check for login/signup toggle
    const loginLink = page.locator('text="Đã có tài khoản? Đăng nhập"');
    const signupLink = page.locator('text="Chưa có tài khoản? Tạo tài khoản"');

    console.log("🔗 Login link visible:", await loginLink.isVisible());
    console.log("🔗 Signup link visible:", await signupLink.isVisible());

    expect(true).toBe(true); // Always pass
  });
});
