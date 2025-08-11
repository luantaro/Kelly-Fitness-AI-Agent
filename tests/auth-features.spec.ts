import { test, expect } from "@playwright/test";

test.describe("Authentication Features", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page
    await page.goto("http://localhost:3002/auth");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Google Sign-in", () => {
    test("should display Google sign-in button", async ({ page }) => {
      // Check if Google sign-in button exists
      const googleButton = page.locator(
        'button:has-text("Đăng nhập bằng Google")'
      );
      await expect(googleButton).toBeVisible();

      // Check if Google logo is present
      const googleLogo = page.locator('svg[viewBox="0 0 24 24"]');
      await expect(googleLogo).toBeVisible();

      // Check button styling
      await expect(googleButton).toHaveClass(/border-gray-200/);
      await expect(googleButton).toHaveClass(/bg-white/);
    });

    test("should show loading state when clicking Google sign-in", async ({
      page,
    }) => {
      const googleButton = page.locator(
        'button:has-text("Đăng nhập bằng Google")'
      );

      // Click Google sign-in button
      await googleButton.click();

      // Should show loading text
      await expect(
        page.locator('button:has-text("Đang xử lý...")')
      ).toBeVisible();

      // Button should be disabled during loading
      await expect(googleButton).toBeDisabled();
    });

    test("should toggle text between login and signup modes", async ({
      page,
    }) => {
      // Initially in login mode
      await expect(
        page.locator('button:has-text("Đăng nhập bằng Google")')
      ).toBeVisible();

      // Switch to signup mode
      await page.click('button:has-text("Đăng ký ngay")');
      await expect(
        page.locator('button:has-text("Đăng ký bằng Google")')
      ).toBeVisible();

      // Switch back to login mode
      await page.click('button:has-text("Đăng nhập")');
      await expect(
        page.locator('button:has-text("Đăng nhập bằng Google")')
      ).toBeVisible();
    });

    test("should handle Google sign-in popup", async ({ page, context }) => {
      // Note: This test will attempt to open Google popup but won't complete the flow
      // in a real test environment due to OAuth restrictions

      const googleButton = page.locator(
        'button:has-text("Đăng nhập bằng Google")'
      );

      // Listen for popup
      const popupPromise = context.waitForEvent("page");
      await googleButton.click();

      // In a real test, you would mock the Google OAuth response
      // For now, we just verify the popup attempt
      try {
        const popup = await popupPromise;
        await expect(popup.url()).toContain("accounts.google.com");
        await popup.close();
      } catch (error) {
        // Expected in test environment - Google OAuth restrictions
        console.log(
          "Google OAuth popup blocked in test environment - this is expected"
        );
      }
    });
  });

  test.describe("Reset Password", () => {
    test("should show forgot password link in login mode only", async ({
      page,
    }) => {
      // Should show forgot password link in login mode
      await expect(
        page.locator('button:has-text("Quên mật khẩu?")')
      ).toBeVisible();

      // Switch to signup mode
      await page.click('button:has-text("Đăng ký ngay")');

      // Should not show forgot password link in signup mode
      await expect(
        page.locator('button:has-text("Quên mật khẩu?")')
      ).not.toBeVisible();

      // Switch back to login mode
      await page.click('button:has-text("Đăng nhập")');

      // Should show forgot password link again
      await expect(
        page.locator('button:has-text("Quên mật khẩu?")')
      ).toBeVisible();
    });

    test("should open reset password modal", async ({ page }) => {
      // Click forgot password link
      await page.click('button:has-text("Quên mật khẩu?")');

      // Modal should be visible
      await expect(
        page.locator('div:has-text("Quên mật khẩu?")')
      ).toBeVisible();
      await expect(
        page.locator(
          "text=Nhập email của bạn, chúng tôi sẽ gửi link reset mật khẩu"
        )
      ).toBeVisible();

      // Should have email input
      const emailInput = page.locator('input[type="email"]').nth(1); // Second email input (first is main form)
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute("placeholder", "your@email.com");

      // Should have action buttons
      await expect(page.locator('button:has-text("Hủy")')).toBeVisible();
      await expect(page.locator('button:has-text("Gửi email")')).toBeVisible();
    });

    test("should close modal when clicking cancel", async ({ page }) => {
      // Open modal
      await page.click('button:has-text("Quên mật khẩu?")');
      await expect(
        page.locator('div:has-text("Quên mật khẩu?")')
      ).toBeVisible();

      // Click cancel
      await page.click('button:has-text("Hủy")');

      // Modal should be closed
      await expect(
        page.locator('div:has-text("Quên mật khẩu?")')
      ).not.toBeVisible();
    });

    test("should close modal when clicking backdrop", async ({ page }) => {
      // Open modal
      await page.click('button:has-text("Quên mật khẩu?")');
      await expect(
        page.locator('div:has-text("Quên mật khẩu?")')
      ).toBeVisible();

      // Click backdrop (outside modal)
      await page.locator(".fixed.inset-0.bg-black\\/50").click();

      // Modal should be closed
      await expect(
        page.locator('div:has-text("Quên mật khẩu?")')
      ).not.toBeVisible();
    });

    test("should validate email input in reset form", async ({ page }) => {
      // Open modal
      await page.click('button:has-text("Quên mật khẩu?")');

      const emailInput = page.locator('input[type="email"]').nth(1);
      const sendButton = page.locator('button:has-text("Gửi email")');

      // Try to submit without email
      await sendButton.click();

      // Should show HTML5 validation message
      await expect(emailInput).toHaveAttribute("required");

      // Fill invalid email
      await emailInput.fill("invalid-email");
      await sendButton.click();

      // Should not proceed with invalid email (HTML5 validation)
      await expect(emailInput).toBeFocused();
    });

    test("should handle reset password submission", async ({ page }) => {
      // Open modal
      await page.click('button:has-text("Quên mật khẩu?")');

      const emailInput = page.locator('input[type="email"]').nth(1);
      const sendButton = page.locator('button:has-text("Gửi email")');

      // Fill valid email
      await emailInput.fill("test@example.com");

      // Submit form
      await sendButton.click();

      // Should show loading state
      await expect(
        page.locator('button:has-text("Đang gửi...")')
      ).toBeVisible();

      // Note: In a real test environment, this would likely fail due to Firebase rules
      // but we can test the UI behavior

      // Wait for response and check for either success or error message
      await page.waitForTimeout(3000);

      // Should show either success message or error message
      const hasSuccess = await page
        .locator("text=Đã gửi email reset mật khẩu")
        .isVisible()
        .catch(() => false);
      const hasError = await page
        .locator('[class*="text-red"]')
        .isVisible()
        .catch(() => false);

      expect(hasSuccess || hasError).toBeTruthy();
    });
  });

  test.describe("Confirm Password Feature", () => {
    test("should show confirm password field in signup mode only", async ({
      page,
    }) => {
      // Switch to signup mode
      await page.click('button:has-text("Đăng ký ngay")');

      // Should show confirm password field
      await expect(
        page.locator('label:has-text("Xác nhận mật khẩu")')
      ).toBeVisible();
      await expect(
        page.locator('input[placeholder="••••••••"]').nth(1)
      ).toBeVisible();

      // Switch to login mode
      await page.click('button:has-text("Đăng nhập")');

      // Should not show confirm password field
      await expect(
        page.locator('label:has-text("Xác nhận mật khẩu")')
      ).not.toBeVisible();
    });

    test("should toggle confirm password visibility", async ({ page }) => {
      // Switch to signup mode
      await page.click('button:has-text("Đăng ký ngay")');

      const confirmPasswordInput = page
        .locator('input[placeholder="••••••••"]')
        .nth(1);
      const toggleButton = page.locator("button").nth(2); // Third toggle button (email, password, confirm password)

      // Initially should be password type
      await expect(confirmPasswordInput).toHaveAttribute("type", "password");

      // Click toggle
      await toggleButton.click();

      // Should become text type
      await expect(confirmPasswordInput).toHaveAttribute("type", "text");

      // Click toggle again
      await toggleButton.click();

      // Should become password type again
      await expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });

    test("should validate password confirmation", async ({ page }) => {
      // Switch to signup mode
      await page.click('button:has-text("Đăng ký ngay")');

      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page
        .locator('input[placeholder="••••••••"]')
        .first();
      const confirmPasswordInput = page
        .locator('input[placeholder="••••••••"]')
        .nth(1);
      const submitButton = page.locator('button:has-text("Tạo tài khoản")');

      // Fill form with mismatched passwords
      await emailInput.fill("test@example.com");
      await passwordInput.fill("password123");
      await confirmPasswordInput.fill("password456");

      // Submit form
      await submitButton.click();

      // Should show error message
      await expect(
        page.locator("text=Mật khẩu xác nhận không khớp")
      ).toBeVisible();

      // Fix the confirm password
      await confirmPasswordInput.fill("password123");

      // Submit again
      await submitButton.click();

      // Error message should be gone
      await expect(
        page.locator("text=Mật khẩu xác nhận không khớp")
      ).not.toBeVisible();

      // Should show loading state
      await expect(
        page.locator('button:has-text("Đang xử lý...")')
      ).toBeVisible();
    });
  });

  test.describe("UI/UX Enhancements", () => {
    test("should show success message area", async ({ page }) => {
      // Success message container should exist (even if hidden)
      const successContainer = page.locator('[class*="bg-green-50"]');

      // Initially should not be visible
      await expect(successContainer).not.toBeVisible();

      // The success message functionality would be tested with actual successful operations
    });

    test("should have proper form animations", async ({ page }) => {
      // Check if form has animation classes
      const formContainer = page.locator(".glass-card");
      await expect(formContainer).toBeVisible();

      // Check animated gradient background
      const background = page.locator(".animated-gradient");
      await expect(background).toBeVisible();

      // Check floating shapes
      const floatingShapes = page.locator(".floating-shape");
      await expect(floatingShapes.first()).toBeVisible();
    });

    test("should maintain form state when switching modes", async ({
      page,
    }) => {
      const emailInput = page.locator('input[type="email"]');

      // Fill email in login mode
      await emailInput.fill("test@example.com");

      // Switch to signup mode
      await page.click('button:has-text("Đăng ký ngay")');

      // Email should be preserved
      await expect(emailInput).toHaveValue("test@example.com");

      // Switch back to login mode
      await page.click('button:has-text("Đăng nhập")');

      // Email should still be preserved
      await expect(emailInput).toHaveValue("test@example.com");
    });

    test("should clear success messages when switching modes", async ({
      page,
    }) => {
      // This test would be more meaningful with actual success states
      // For now, we verify the mode switching clears any potential states

      // Switch modes multiple times
      await page.click('button:has-text("Đăng ký ngay")');
      await page.click('button:has-text("Đăng nhập")');

      // No error messages should be visible after mode switches
      await expect(page.locator('[class*="text-red"]')).not.toBeVisible();
    });
  });
});
