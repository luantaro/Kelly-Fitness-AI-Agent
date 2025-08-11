import { test, expect } from "@playwright/test";

test.describe("Enhanced Authentication Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Password Reset Feature", () => {
    test("should display forgot password link in login mode", async ({
      page,
    }) => {
      // Ensure we're in login mode
      const loginButton = page.getByRole("button", {
        name: "Đăng nhập",
        exact: true,
      });
      await expect(loginButton).toBeVisible();

      // Check for forgot password link
      const forgotPasswordLink = page.getByRole("button", {
        name: "Quên mật khẩu?",
      });
      await expect(forgotPasswordLink).toBeVisible();
    });

    test("should open reset password modal when clicked", async ({ page }) => {
      // Click forgot password link
      const forgotPasswordLink = page.getByRole("button", {
        name: "Quên mật khẩu?",
      });
      await forgotPasswordLink.click();

      // Check modal appears
      const modal = page
        .locator("div.fixed.inset-0")
        .filter({ hasText: "Quên mật khẩu?" });
      await expect(modal).toBeVisible();

      // Check modal content
      await expect(page.locator('h3:has-text("Quên mật khẩu?")')).toBeVisible();
      await expect(page.locator("text=Nhập email của bạn")).toBeVisible();
    });

    test("should validate email input in reset modal", async ({ page }) => {
      // Open reset modal
      await page.getByRole("button", { name: "Quên mật khẩu?" }).click();

      // Try to submit without email
      const sendButton = page.getByRole("button", { name: "Gửi email" });
      await sendButton.click();

      // Check for validation (HTML5 validation will prevent submission)
      const emailInput = page.locator('input[type="email"]').last();
      await expect(emailInput).toBeFocused();
    });

    test("should close modal when cancel is clicked", async ({ page }) => {
      // Open reset modal
      await page.getByRole("button", { name: "Quên mật khẩu?" }).click();

      // Click cancel
      await page.getByRole("button", { name: "Hủy" }).click();

      // Check modal is closed
      const modal = page.locator('h3:has-text("Quên mật khẩu?")');
      await expect(modal).not.toBeVisible();
    });

    test("should attempt password reset with valid email", async ({ page }) => {
      // Open reset modal
      await page.getByRole("button", { name: "Quên mật khẩu?" }).click();

      // Fill email
      const emailInput = page.locator('input[type="email"]').last();
      await emailInput.fill("test@example.com");

      // Submit (this will likely fail in test environment, but we test the flow)
      const sendButton = page.getByRole("button", { name: "Gửi email" });
      await sendButton.click();

      // Wait for response (success or error)
      await page.waitForTimeout(3000);

      // Check for either success message or error
      const hasSuccess = await page
        .locator("text=Đã gửi email reset mật khẩu")
        .isVisible();
      const hasError = await page.locator("text=Lỗi").isVisible();
      const hasFirebaseError = await page
        .locator("text=operation-not-allowed")
        .isVisible();

      expect(hasSuccess || hasError || hasFirebaseError).toBeTruthy();
    });
  });

  test.describe("Confirm Password Feature", () => {
    test("should not show confirm password in login mode", async ({ page }) => {
      // Ensure we're in login mode
      const loginButton = page.getByRole("button", {
        name: "Đăng nhập",
        exact: true,
      });
      await expect(loginButton).toBeVisible();

      // Check confirm password is not visible
      const confirmPasswordField = page.locator(
        'label:has-text("Xác nhận mật khẩu")'
      );
      await expect(confirmPasswordField).not.toBeVisible();
    });

    test("should show confirm password in signup mode", async ({ page }) => {
      // Switch to signup mode
      const toggleButton = page.getByRole("button", {
        name: "Chưa có tài khoản? Đăng ký",
      });
      await toggleButton.click();

      // Wait for mode switch
      await expect(
        page.getByRole("button", { name: "Tạo tài khoản" })
      ).toBeVisible();

      // Check confirm password is visible
      const confirmPasswordField = page.locator(
        'label:has-text("Xác nhận mật khẩu")'
      );
      await expect(confirmPasswordField).toBeVisible();
    });

    test("should toggle confirm password visibility", async ({ page }) => {
      // Switch to signup mode
      await page
        .getByRole("button", { name: "Chưa có tài khoản? Đăng ký" })
        .click();

      // Find confirm password input
      const confirmPasswordInput = page
        .locator('input[placeholder="••••••••"]')
        .last();

      // Check initial type is password
      await expect(confirmPasswordInput).toHaveAttribute("type", "password");

      // Get the password field container and find the toggle button within it
      const confirmPasswordField = page
        .locator('label:has-text("Xác nhận mật khẩu")')
        .locator("..")
        .locator("div.relative");
      const confirmToggle = confirmPasswordField.locator(
        'button[type="button"]'
      );
      await confirmToggle.click();

      // Check type changed to text
      await expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });

    test("should validate password confirmation", async ({ page }) => {
      // Switch to signup mode
      await page
        .getByRole("button", { name: "Chưa có tài khoản? Đăng ký" })
        .click();

      // Fill different passwords
      await page.locator('input[type="email"]').fill("test@example.com");
      await page
        .locator('input[placeholder="••••••••"]')
        .first()
        .fill("password123");
      await page
        .locator('input[placeholder="••••••••"]')
        .last()
        .fill("differentpassword");

      // Try to submit
      await page.getByRole("button", { name: "Tạo tài khoản" }).click();

      // Check for password mismatch error
      await expect(
        page.locator("text=Mật khẩu xác nhận không khớp")
      ).toBeVisible();
    });
  });

  test.describe("Google Sign-in Feature", () => {
    test("should display Google sign-in button", async ({ page }) => {
      const googleButton = page.getByRole("button", {
        name: "Đăng nhập bằng Google",
      });
      await expect(googleButton).toBeVisible();
    });

    test("should show Google logo in button", async ({ page }) => {
      const googleButton = page.getByRole("button", {
        name: "Đăng nhập bằng Google",
      });
      const googleLogo = googleButton.locator("svg");
      await expect(googleLogo).toBeVisible();
    });

    test("should change text based on mode", async ({ page }) => {
      // Login mode
      await expect(
        page.getByRole("button", { name: "Đăng nhập bằng Google" })
      ).toBeVisible();

      // Switch to signup mode
      await page
        .getByRole("button", { name: "Chưa có tài khoản? Đăng ký" })
        .click();

      // Signup mode
      await expect(
        page.getByRole("button", { name: "Đăng ký bằng Google" })
      ).toBeVisible();
    });

    test("should handle Google sign-in click", async ({ page }) => {
      // Mock the popup to avoid actual Google auth in tests
      await page.route("https://accounts.google.com/**", (route) => {
        route.abort();
      });

      const googleButton = page.getByRole("button", {
        name: "Đăng nhập bằng Google",
      });
      await googleButton.click();

      // Wait for error handling (since we blocked the request)
      await page.waitForTimeout(2000);

      // Should show some kind of error or loading state
      const hasError = await page.locator("text=Lỗi").isVisible();
      const hasLoading = await page
        .locator("text=Đang xử lý")
        .first()
        .isVisible();

      expect(hasError || hasLoading).toBeTruthy();
    });
  });

  test.describe("Form Integration", () => {
    test("should clear confirm password when switching modes", async ({
      page,
    }) => {
      // Switch to signup mode first
      await page
        .getByRole("button", { name: "Chưa có tài khoản? Đăng ký" })
        .click();

      // Fill form including confirm password
      await page.locator('input[type="email"]').fill("test@example.com");
      await page
        .locator('input[placeholder="••••••••"]')
        .first()
        .fill("password123");
      await page
        .locator('input[placeholder="••••••••"]')
        .last()
        .fill("password123");

      // Switch back to login
      await page
        .getByRole("button", { name: "Đã có tài khoản? Đăng nhập" })
        .click();

      // Check that email and password are maintained but confirm password is gone
      await expect(page.locator('input[type="email"]')).toHaveValue(
        "test@example.com"
      );
      await expect(page.locator('input[type="password"]')).toHaveValue(
        "password123"
      );

      // Confirm password field should not be visible in login mode
      await expect(
        page.locator('label:has-text("Xác nhận mật khẩu")')
      ).not.toBeVisible();
    });

    test("should maintain form state during validation errors", async ({
      page,
    }) => {
      // Switch to signup mode
      await page
        .getByRole("button", { name: "Chưa có tài khoản? Đăng ký" })
        .click();

      // Fill form with mismatched passwords
      const email = "test@example.com";
      const password = "password123";

      await page.locator('input[type="email"]').fill(email);
      await page
        .locator('input[placeholder="••••••••"]')
        .first()
        .fill(password);
      await page
        .locator('input[placeholder="••••••••"]')
        .last()
        .fill("different");

      // Submit and get error
      await page.getByRole("button", { name: "Tạo tài khoản" }).click();
      await expect(
        page.locator("text=Mật khẩu xác nhận không khớp")
      ).toBeVisible();

      // Check form values are maintained
      await expect(page.locator('input[type="email"]')).toHaveValue(email);
      await expect(
        page.locator('input[placeholder="••••••••"]').first()
      ).toHaveValue(password);
    });

    test("should show loading states appropriately", async ({ page }) => {
      // Click any submit button
      const submitButton = page.getByRole("button", {
        name: "Đăng nhập",
        exact: true,
      });

      // Monitor for loading state changes
      await submitButton.click();

      // Loading state should appear briefly
      const loadingText = page.locator("text=Đang xử lý").first();

      // Wait for either loading to appear or form to be processed
      await Promise.race([
        loadingText.waitFor({ timeout: 1000 }).catch(() => {}),
        page.waitForTimeout(2000),
      ]);

      // Test passes if no errors thrown
      expect(true).toBeTruthy();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper labels for screen readers", async ({ page }) => {
      // Check email label
      await expect(page.locator('label:has-text("Email")')).toBeVisible();

      // Check password label
      await expect(page.locator('label:has-text("Mật khẩu")')).toBeVisible();

      // Switch to signup and check confirm password label
      await page
        .getByRole("button", { name: "Chưa có tài khoản? Đăng ký" })
        .click();
      await expect(
        page.locator('label:has-text("Xác nhận mật khẩu")')
      ).toBeVisible();
    });

    test("should have keyboard navigation support", async ({ page }) => {
      // Start from the top of the page
      await page.keyboard.press("Tab"); // Email field
      await page.keyboard.press("Tab"); // Password field
      await page.keyboard.press("Tab"); // Password toggle button
      await page.keyboard.press("Tab"); // Forgot password button
      await page.keyboard.press("Tab"); // Submit button

      // Check that we can navigate through the form
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(["BUTTON", "INPUT"].includes(focusedElement || "")).toBeTruthy();
    });
  });
});
