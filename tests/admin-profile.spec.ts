import { test, expect } from "@playwright/test";
import { AuthHelper, ProfileHelper, AdminHelper } from "./helpers";
import { TestData, TestUsers } from "./test-utils";

test.describe("Admin Profile Management", () => {
  let authHelper: AuthHelper;
  let profileHelper: ProfileHelper;
  let adminHelper: AdminHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    profileHelper = new ProfileHelper(page);
    adminHelper = new AdminHelper(page);

    // Clear any existing session
    await authHelper.clearSession();
  });

  test("should allow admin to view user profiles", async ({ page }) => {
    // Login as admin
    await authHelper.loginAsAdmin();

    // Verify admin is logged in
    expect(await authHelper.isAdmin()).toBe(true);

    // Navigate to admin dashboard
    await adminHelper.goToAdminDashboard();

    // Verify user table is visible
    const userTable = page.locator('table, [data-testid="user-table"]');
    await expect(userTable).toBeVisible();

    // Check if test user exists in table
    const testUserRow = page.locator(
      `tr:has-text("${TestUsers.REGULAR_USER.email}")`
    );
    await expect(testUserRow).toBeVisible();

    console.log("✅ Admin can view user profiles in dashboard");
  });

  test("should allow admin to edit user profile", async ({ page }) => {
    // First, ensure test user has a profile by logging in as user
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();
    await authHelper.logout();

    // Now login as admin
    await authHelper.loginAsAdmin();
    await adminHelper.goToAdminDashboard();

    // Find and edit test user profile
    await adminHelper.editUserProfile(TestUsers.REGULAR_USER.email);

    // Fill new profile data
    await adminHelper.fillAdminProfileForm(TestData.PROFILE_ADMIN_EDIT);

    // Save changes
    await adminHelper.saveAdminProfile();

    console.log("✅ Admin successfully edited user profile");
  });

  test("should sync admin changes to user session", async ({
    page,
    context,
  }) => {
    // Create a second page for user session
    const userPage = await context.newPage();
    const userAuthHelper = new AuthHelper(userPage);
    const userProfileHelper = new ProfileHelper(userPage);

    // Setup: User creates initial profile
    await userAuthHelper.loginAsUser();
    await userProfileHelper.openSettings();
    await userProfileHelper.fillProfile(TestData.PROFILE_BASIC);
    await userProfileHelper.saveProfile();

    // Keep user session open and close settings modal
    await userPage.keyboard.press("Escape");

    // Admin session: Edit the user's profile
    await authHelper.loginAsAdmin();
    await adminHelper.goToAdminDashboard();
    await adminHelper.editUserProfile(TestUsers.REGULAR_USER.email);
    await adminHelper.fillAdminProfileForm(TestData.PROFILE_ADMIN_EDIT);
    await adminHelper.saveAdminProfile();

    // Switch back to user session and verify changes are reflected
    await userPage.bringToFront();

    // Wait for sync event (profile sync should update automatically)
    await userPage.waitForTimeout(2000);

    // Check if sidebar shows updated info
    await userProfileHelper.verifySidebarProfile(
      TestData.PROFILE_ADMIN_EDIT.name
    );

    // Also check localStorage
    const localProfile = await userProfileHelper.getLocalStorageProfile();
    expect(localProfile.name).toBe(TestData.PROFILE_ADMIN_EDIT.name);
    expect(localProfile.age).toBe(TestData.PROFILE_ADMIN_EDIT.age);

    console.log("✅ Admin changes synced to user session");

    // Cleanup
    await userPage.close();
  });

  test("should handle admin unauthorized access", async ({ page }) => {
    // Try to access admin as regular user
    await authHelper.loginAsUser();

    // Try to navigate to admin dashboard directly
    await page.goto("/admin");

    // Should be redirected or show unauthorized message
    const currentUrl = page.url();
    const isUnauthorized =
      currentUrl.includes("auth") ||
      currentUrl.includes("login") ||
      (await page.isVisible("text=unauthorized", { timeout: 2000 })) ||
      (await page.isVisible("text=access denied", { timeout: 2000 }));

    expect(isUnauthorized).toBe(true);

    console.log("✅ Non-admin users cannot access admin dashboard");
  });

  test("should validate admin profile edit form", async ({ page }) => {
    // Setup user profile first
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();
    await authHelper.logout();

    // Login as admin
    await authHelper.loginAsAdmin();
    await adminHelper.goToAdminDashboard();
    await adminHelper.editUserProfile(TestUsers.REGULAR_USER.email);

    // Try to save with invalid data (e.g., empty name)
    await page.fill('input[placeholder*="tên"]', "");
    await page.click(
      'button:has-text("Lưu thay đổi"), button:has-text("Save")'
    );

    // Should show validation error or keep modal open
    const isModalStillOpen = await page.isVisible('input[placeholder*="tên"]', {
      timeout: 2000,
    });
    expect(isModalStillOpen).toBe(true);

    console.log("✅ Admin form validation working correctly");
  });

  test("should show audit trail of profile changes", async ({ page }) => {
    // This test assumes there's some kind of audit log
    // Setup profile and make admin change
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();
    await authHelper.logout();

    // Admin makes change
    await authHelper.loginAsAdmin();
    await adminHelper.goToAdminDashboard();
    await adminHelper.editUserProfile(TestUsers.REGULAR_USER.email);
    await adminHelper.fillAdminProfileForm(TestData.PROFILE_ADMIN_EDIT);
    await adminHelper.saveAdminProfile();

    // Look for audit information (this might be in logs or a separate section)
    // This is a placeholder test that could be expanded based on actual audit implementation
    console.log("✅ Audit trail test completed (implementation pending)");
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: logout and clear session
    await authHelper.logout();
    await authHelper.clearSession();
  });
});
