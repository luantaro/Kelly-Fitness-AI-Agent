import { test, expect } from "@playwright/test";
import { AuthHelper, ProfileHelper, AdminHelper, APIHelper } from "./helpers";
import { TestData, TestUsers } from "./test-utils";

test.describe("Bidirectional Profile Sync", () => {
  let authHelper: AuthHelper;
  let profileHelper: ProfileHelper;
  let adminHelper: AdminHelper;
  let apiHelper: APIHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    profileHelper = new ProfileHelper(page);
    adminHelper = new AdminHelper(page);
    apiHelper = new APIHelper(page);

    // Clear any existing session
    await authHelper.clearSession();
  });

  test("should sync profile from user to admin dashboard", async ({
    page,
    context,
  }) => {
    // Create admin page
    const adminPage = await context.newPage();
    const adminAuthHelper = new AuthHelper(adminPage);
    const adminAdminHelper = new AdminHelper(adminPage);

    // User creates profile
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_COMPLETE);
    await profileHelper.saveProfile();

    // Admin views dashboard
    await adminAuthHelper.loginAsAdmin();
    await adminAdminHelper.goToAdminDashboard();

    // Verify user's profile is visible in admin dashboard
    const userRow = adminPage.locator(
      `tr:has-text("${TestUsers.REGULAR_USER.email}")`
    );
    await expect(userRow).toBeVisible();

    // Check if profile data is reflected (this might need specific selectors based on your UI)
    const profileText = await userRow.textContent();
    expect(profileText).toContain(TestData.PROFILE_COMPLETE.name);

    console.log("✅ User profile synced to admin dashboard");

    await adminPage.close();
  });

  test("should sync profile from admin to user in real-time", async ({
    page,
    context,
  }) => {
    // Setup: User creates initial profile and stays logged in
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();
    await page.keyboard.press("Escape"); // Close settings modal

    // Create admin session in new page
    const adminPage = await context.newPage();
    const adminAuthHelper = new AuthHelper(adminPage);
    const adminAdminHelper = new AdminHelper(adminPage);

    await adminAuthHelper.loginAsAdmin();
    await adminAdminHelper.goToAdminDashboard();

    // Admin edits user profile
    await adminAdminHelper.editUserProfile(TestUsers.REGULAR_USER.email);
    await adminAdminHelper.fillAdminProfileForm(TestData.PROFILE_ADMIN_EDIT);
    await adminAdminHelper.saveAdminProfile();

    console.log("Admin saved profile changes");

    // Switch back to user page and verify real-time sync
    await page.bringToFront();

    // Wait for sync event
    await page.waitForTimeout(3000);

    // Verify sidebar shows updated info
    await profileHelper.verifySidebarProfile(TestData.PROFILE_ADMIN_EDIT.name);

    // Verify localStorage is updated
    const localProfile = await profileHelper.getLocalStorageProfile();
    expect(localProfile.name).toBe(TestData.PROFILE_ADMIN_EDIT.name);
    expect(localProfile.age).toBe(TestData.PROFILE_ADMIN_EDIT.age);

    // Verify if user opens settings, the form shows updated data
    await profileHelper.openSettings();
    const nameInput = page.locator(
      'input[placeholder*="tên"], input[placeholder*="name"]'
    );
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe(TestData.PROFILE_ADMIN_EDIT.name);

    console.log("✅ Admin changes synced to user in real-time");

    await adminPage.close();
  });

  test("should handle concurrent profile edits", async ({ page, context }) => {
    // Create two user sessions
    const userPage2 = await context.newPage();
    const userAuthHelper2 = new AuthHelper(userPage2);
    const userProfileHelper2 = new ProfileHelper(userPage2);

    // Both sessions login as same user (simulating multiple tabs)
    await authHelper.loginAsUser();
    await userAuthHelper2.loginAsUser();

    // First session creates profile
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();
    await page.keyboard.press("Escape");

    // Second session should receive the update
    await userPage2.waitForTimeout(2000);
    const localProfile2 = await userProfileHelper2.getLocalStorageProfile();
    expect(localProfile2.name).toBe(TestData.PROFILE_BASIC.name);

    // Second session updates profile
    await userProfileHelper2.openSettings();
    const updatedProfile = {
      ...TestData.PROFILE_BASIC,
      name: "Concurrent Edit Test",
      age: 30,
    };
    await userProfileHelper2.fillProfile(updatedProfile);
    await userProfileHelper2.saveProfile();

    // First session should receive the update
    await page.waitForTimeout(2000);
    const localProfile1 = await profileHelper.getLocalStorageProfile();
    expect(localProfile1.name).toBe("Concurrent Edit Test");
    expect(localProfile1.age).toBe(30);

    console.log("✅ Concurrent edits handled correctly");

    await userPage2.close();
  });

  test("should sync across page refreshes", async ({ page }) => {
    // User creates profile
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_COMPLETE);
    await profileHelper.saveProfile();

    // Refresh page
    await page.reload();

    // Login again if needed
    if (!(await authHelper.isLoggedIn())) {
      await authHelper.loginAsUser();
    }

    // Verify profile persisted
    const localProfile = await profileHelper.getLocalStorageProfile();
    expect(localProfile.name).toBe(TestData.PROFILE_COMPLETE.name);

    // Verify sidebar shows profile
    await profileHelper.verifySidebarProfile(TestData.PROFILE_COMPLETE.name);

    console.log("✅ Profile sync persists across page refreshes");
  });

  test("should handle API failures gracefully", async ({ page }) => {
    // User creates profile offline (localStorage only)
    await authHelper.loginAsUser();

    // Set profile in localStorage directly
    await profileHelper.setLocalStorageProfile(TestData.PROFILE_BASIC);

    // Refresh to trigger sync attempt
    await page.reload();

    if (!(await authHelper.isLoggedIn())) {
      await authHelper.loginAsUser();
    }

    // Intercept API calls and simulate server error
    await page.route("**/api/user/profile", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    // Try to sync profile
    await profileHelper.openSettings();
    await profileHelper.saveProfile();

    // Profile should still be available locally
    const localProfile = await profileHelper.getLocalStorageProfile();
    expect(localProfile).toBeTruthy();

    console.log("✅ API failures handled gracefully");
  });

  test("should validate profile data integrity", async ({ page, context }) => {
    // Create admin session
    const adminPage = await context.newPage();
    const adminAuthHelper = new AuthHelper(adminPage);
    const adminAdminHelper = new AdminHelper(adminPage);

    // User creates profile with specific data
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_COMPLETE);
    await profileHelper.saveProfile();

    // Admin views and modifies profile
    await adminAuthHelper.loginAsAdmin();
    await adminAdminHelper.goToAdminDashboard();
    await adminAdminHelper.editUserProfile(TestUsers.REGULAR_USER.email);

    // Verify admin sees correct current data
    const nameInput = adminPage.locator('input[placeholder*="tên"]');
    const currentName = await nameInput.inputValue();
    expect(currentName).toBe(TestData.PROFILE_COMPLETE.name);

    // Admin makes change
    await adminAdminHelper.fillAdminProfileForm(TestData.PROFILE_ADMIN_EDIT);
    await adminAdminHelper.saveAdminProfile();

    // User should see the exact same data
    await page.bringToFront();
    await page.waitForTimeout(2000);

    const userLocalProfile = await profileHelper.getLocalStorageProfile();
    expect(userLocalProfile.name).toBe(TestData.PROFILE_ADMIN_EDIT.name);
    expect(userLocalProfile.age).toBe(TestData.PROFILE_ADMIN_EDIT.age);
    expect(userLocalProfile.height).toBe(TestData.PROFILE_ADMIN_EDIT.height);
    expect(userLocalProfile.weight).toBe(TestData.PROFILE_ADMIN_EDIT.weight);

    console.log("✅ Profile data integrity maintained across sync");

    await adminPage.close();
  });

  test("should handle authentication state changes", async ({ page }) => {
    // User creates profile
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();

    // Logout and login again
    await authHelper.logout();
    await authHelper.loginAsUser();

    // Profile should still be available
    const localProfile = await profileHelper.getLocalStorageProfile();
    expect(localProfile.name).toBe(TestData.PROFILE_BASIC.name);

    // Sidebar should show profile
    await profileHelper.verifySidebarProfile(TestData.PROFILE_BASIC.name);

    console.log("✅ Profile sync handles auth state changes");
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
    await authHelper.logout();
    await authHelper.clearSession();
  });
});
