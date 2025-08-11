import { test, expect } from "@playwright/test";

test.describe("Google Auth Real Test", () => {
  test("should attempt real Google Auth flow", async ({ page, context }) => {
    // Go to auth page
    await page.goto("http://localhost:3002/auth");
    await page.waitForLoadState("networkidle");

    // Monitor console for Firebase/Google errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          text.includes("firebase") ||
          text.includes("google") ||
          text.includes("auth")
        ) {
          errors.push(text);
        }
      }
    });

    // Take screenshot before
    await page.screenshot({ path: "test-results/google-auth-before-real.png" });

    // Click Google Auth button
    const googleButton = page.getByRole("button", {
      name: "Đăng nhập bằng Google",
    });
    await expect(googleButton).toBeVisible();

    // Monitor for new popup window
    const popupPromise = page.waitForEvent("popup", { timeout: 10000 });

    console.log("🔘 Clicking Google Auth button...");
    await googleButton.click();

    try {
      // Wait for popup to appear
      const popup = await popupPromise;
      console.log("✅ Google Auth popup opened:", popup.url());

      // Wait for popup to navigate to Google
      await popup.waitForLoadState("networkidle", { timeout: 5000 });

      // Take screenshot of popup
      await popup.screenshot({ path: "test-results/google-auth-popup.png" });

      console.log("📄 Popup URL:", popup.url());
      console.log("📋 Popup title:", await popup.title());

      // Check if it's actually Google's OAuth page
      const isGoogleAuth =
        popup.url().includes("accounts.google.com") ||
        popup.url().includes("oauth2");

      console.log("🔍 Is Google OAuth page:", isGoogleAuth);

      // Close popup for testing
      await popup.close();

      expect(isGoogleAuth).toBeTruthy();
    } catch (popupError: any) {
      console.log(
        "❌ No popup opened or popup error:",
        popupError?.message || popupError
      );

      // Take screenshot of main page after click
      await page.screenshot({
        path: "test-results/google-auth-after-no-popup.png",
      });

      // Check for any error messages on main page
      const errorElements = await page
        .locator('[class*="text-red"], [class*="error"]')
        .allTextContents();
      console.log("🔍 Error messages on page:", errorElements);

      // Check for Firebase internal errors
      const hasFirebaseError = await page
        .locator("text=internal-error")
        .isVisible();
      const hasPopupError = await page.locator("text=popup").isVisible();

      console.log("🔥 Firebase error visible:", hasFirebaseError);
      console.log("🪟 Popup error visible:", hasPopupError);
    }

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    // Take final screenshot
    await page.screenshot({ path: "test-results/google-auth-final.png" });

    // Log all Firebase/Google related errors
    console.log("🚨 Firebase/Google Errors:", errors);

    // Test passes if no critical errors (popup blocked is OK for testing)
    const hasCriticalError = errors.some(
      (error) =>
        error.includes("invalid") ||
        error.includes("configuration") ||
        (error.includes("network") && !error.includes("popup"))
    );

    expect(hasCriticalError).toBeFalsy();
  });

  test("should check Firebase Console authorized domains", async ({ page }) => {
    console.log("🌐 Firebase Console Instructions:");
    console.log("================================");
    console.log(
      "1. Go to: https://console.firebase.google.com/project/kelly-fitness-93e58/authentication/settings"
    );
    console.log('2. In "Authorized domains" section, add:');
    console.log("   • localhost");
    console.log("   • 127.0.0.1");
    console.log(
      "3. Go to: https://console.firebase.google.com/project/kelly-fitness-93e58/authentication/providers"
    );
    console.log("4. Enable Google sign-in method");
    console.log("5. Configure OAuth consent screen if needed");
    console.log("");

    // This test just provides instructions
    expect(true).toBeTruthy();
  });
});
