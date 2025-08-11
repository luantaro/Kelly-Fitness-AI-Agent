import { test, expect } from "@playwright/test";

test.describe("Debug Tests", () => {
  test("debug homepage elements", async ({ page }) => {
    await page.goto("http://localhost:3001");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Take a screenshot to see what we're working with
    await page.screenshot({
      path: "test-results/debug-homepage.png",
      fullPage: true,
    });

    // Get page title
    const title = await page.title();
    console.log("Page title:", title);

    // Get all button texts to understand the UI
    const buttons = await page.locator("button").all();
    console.log("Found buttons:");
    for (const button of buttons) {
      const text = await button.textContent();
      const id = await button.getAttribute("id");
      const className = await button.getAttribute("class");
      console.log(`  - Text: "${text}", ID: ${id}, Class: ${className}`);
    }

    // Get all input fields
    const inputs = await page.locator("input").all();
    console.log("Found inputs:");
    for (const input of inputs) {
      const type = await input.getAttribute("type");
      const placeholder = await input.getAttribute("placeholder");
      const id = await input.getAttribute("id");
      console.log(
        `  - Type: ${type}, Placeholder: "${placeholder}", ID: ${id}`
      );
    }

    // Get all links
    const links = await page.locator("a").all();
    console.log("Found links:");
    for (const link of links) {
      const text = await link.textContent();
      const href = await link.getAttribute("href");
      console.log(`  - Text: "${text}", Href: ${href}`);
    }

    // Check if any form elements exist
    const forms = await page.locator("form").all();
    console.log(`Found ${forms.length} forms`);

    // Look for any specific login-related text
    const bodyText = await page.textContent("body");
    const hasLoginText =
      bodyText?.includes("login") ||
      bodyText?.includes("đăng nhập") ||
      bodyText?.includes("email") ||
      bodyText?.includes("password");
    console.log("Has login-related text:", hasLoginText);

    console.log("✅ Debug information collected");
  });

  test("debug after attempting login", async ({ page }) => {
    await page.goto("http://localhost:3001");
    await page.waitForLoadState("networkidle");

    // Try to find and fill email field
    const emailInputs = [
      'input[type="email"]',
      'input[placeholder*="email"]',
      'input[placeholder*="Email"]',
      'input[name="email"]',
      'input[id*="email"]',
    ];

    let emailFound = false;
    for (const selector of emailInputs) {
      try {
        const emailInput = page.locator(selector).first();
        if (await emailInput.isVisible({ timeout: 1000 })) {
          console.log(`Found email input with selector: ${selector}`);
          await emailInput.fill("freeuser1@test.com");
          emailFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!emailFound) {
      console.log("❌ No email input found");
      await page.screenshot({
        path: "test-results/debug-no-email.png",
        fullPage: true,
      });
      return;
    }

    // Try to find password field
    const passwordInputs = [
      'input[type="password"]',
      'input[placeholder*="password"]',
      'input[placeholder*="Password"]',
      'input[name="password"]',
      'input[id*="password"]',
    ];

    let passwordFound = false;
    for (const selector of passwordInputs) {
      try {
        const passwordInput = page.locator(selector).first();
        if (await passwordInput.isVisible({ timeout: 1000 })) {
          console.log(`Found password input with selector: ${selector}`);
          await passwordInput.fill("Test123456");
          passwordFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!passwordFound) {
      console.log("❌ No password input found");
      await page.screenshot({
        path: "test-results/debug-no-password.png",
        fullPage: true,
      });
      return;
    }

    // Try to find submit button
    const submitButtons = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("login")',
      'button:has-text("Đăng nhập")',
      'button:has-text("đăng nhập")',
      'input[type="submit"]',
    ];

    let submitFound = false;
    for (const selector of submitButtons) {
      try {
        const submitButton = page.locator(selector).first();
        if (await submitButton.isVisible({ timeout: 1000 })) {
          console.log(`Found submit button with selector: ${selector}`);
          await submitButton.click();
          submitFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!submitFound) {
      console.log("❌ No submit button found");
      await page.screenshot({
        path: "test-results/debug-no-submit.png",
        fullPage: true,
      });
      return;
    }

    // Wait for potential navigation or change
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: "test-results/debug-after-login.png",
      fullPage: true,
    });

    // Check what changed after login attempt
    const newButtons = await page.locator("button").all();
    console.log("Buttons after login attempt:");
    for (const button of newButtons) {
      const text = await button.textContent();
      console.log(`  - "${text}"`);
    }

    console.log("✅ Login attempt debug completed");
  });
});
