import { test, expect } from "@playwright/test";
import { AuthHelper, ProfileHelper } from "./helpers";
import { TestData } from "./test-utils";

test.describe("User Profile Management", () => {
  let authHelper: AuthHelper;
  let profileHelper: ProfileHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    profileHelper = new ProfileHelper(page);

    // Clear any existing session
    await authHelper.clearSession();
  });

  test("should allow user to create and save profile", async ({ page }) => {
    // Login as regular user
    await authHelper.loginAsUser();

    // Verify user is logged in
    expect(await authHelper.isLoggedIn()).toBe(true);

    // Open settings modal
    await profileHelper.openSettings();

    // Fill profile with test data
    await profileHelper.fillProfile(TestData.PROFILE_COMPLETE);

    // Save profile
    await profileHelper.saveProfile();

    // Verify profile is saved in localStorage
    const localProfile = await profileHelper.getLocalStorageProfile();
    expect(localProfile).toBeTruthy();
    expect(localProfile.name).toBe(TestData.PROFILE_COMPLETE.name);
    expect(localProfile.age).toBe(TestData.PROFILE_COMPLETE.age);

    console.log("✅ User profile created and saved successfully");
  });

  test("should sync profile data to sidebar", async ({ page }) => {
    // Login
    await authHelper.loginAsUser();

    // Open settings and fill profile
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_COMPLETE);
    await profileHelper.saveProfile();

    // Close modal by clicking outside or pressing Escape
    await page.keyboard.press("Escape");

    // Wait a moment for sync
    await page.waitForTimeout(1000);

    // Verify sidebar shows the profile name
    await profileHelper.verifySidebarProfile(TestData.PROFILE_COMPLETE.name);

    console.log("✅ Profile data synced to sidebar");
  });

  test("should persist profile data after page refresh", async ({ page }) => {
    // Login and create profile
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();

    // Refresh page
    await page.reload();

    // Login again (if needed)
    if (!(await authHelper.isLoggedIn())) {
      await authHelper.loginAsUser();
    }

    // Verify profile data is still available
    const localProfile = await profileHelper.getLocalStorageProfile();
    expect(localProfile.name).toBe(TestData.PROFILE_BASIC.name);

    // Verify sidebar still shows profile
    await profileHelper.verifySidebarProfile(TestData.PROFILE_BASIC.name);

    console.log("✅ Profile data persisted after refresh");
  });

  test("should update profile data when modified", async ({ page }) => {
    // Login and create initial profile
    await authHelper.loginAsUser();
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();

    // Close and reopen settings
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    await profileHelper.openSettings();

    // Modify profile data
    const updatedProfile = {
      ...TestData.PROFILE_BASIC,
      name: "Updated Test User",
      age: 30,
    };

    await profileHelper.fillProfile(updatedProfile);
    await profileHelper.saveProfile();

    // Verify updates
    const localProfile = await profileHelper.getLocalStorageProfile();
    expect(localProfile.name).toBe("Updated Test User");
    expect(localProfile.age).toBe(30);

    // Verify sidebar updates
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
    await profileHelper.verifySidebarProfile("Updated Test User");

    console.log("✅ Profile data updated successfully");
  });

  test("should handle form validation errors", async ({ page }) => {
    // Login
    await authHelper.loginAsUser();
    await profileHelper.openSettings();

    // Try to save empty form
    await profileHelper.saveProfile();

    // Should show validation errors (check for error message or form still open)
    const isModalStillOpen = await page.isVisible(
      'input[placeholder*="tên"], input[placeholder*="name"]',
      { timeout: 2000 }
    );
    expect(isModalStillOpen).toBe(true);

    console.log("✅ Form validation working correctly");
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Login
    await authHelper.loginAsUser();

    // Intercept API calls and simulate network error
    await page.route("**/api/user/profile", (route) => {
      route.abort("internetdisconnected");
    });

    // Try to save profile
    await profileHelper.openSettings();
    await profileHelper.fillProfile(TestData.PROFILE_BASIC);
    await profileHelper.saveProfile();

    // Should handle error gracefully (profile might save to localStorage but not server)
    const localProfile = await profileHelper.getLocalStorageProfile();
    expect(localProfile).toBeTruthy();

    console.log("✅ Network error handled gracefully");
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: logout and clear session
    await authHelper.logout();
    await authHelper.clearSession();
  });
});
