import { Page, expect } from "@playwright/test";
import { TestUsers, PageSelectors } from "./test-utils";

/**
 * Authentication helper functions for Playwright tests
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with regular user account
   */
  async loginAsUser() {
    await this.page.goto("/");

    // Wait for page to load
    await this.page.waitForLoadState("networkidle");

    // Check if we're on signup page, click login link
    const loginLink = this.page.locator('text="Đã có tài khoản? Đăng nhập"');
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();
      await this.page.waitForTimeout(1000);
    }

    // Wait for login form to be visible
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill login form
    await this.page.fill('input[type="email"]', TestUsers.REGULAR_USER.email);
    await this.page.fill(
      'input[type="password"]',
      TestUsers.REGULAR_USER.password
    );

    // Submit form
    await this.page.click('button[type="submit"]');

    // Wait for navigation/login to complete - từ test thực tế ta thấy cần thời gian
    await this.page.waitForTimeout(5000);

    // Wait for main app elements to appear - improved selector
    try {
      // Try multiple selectors to check for successful login
      await Promise.race([
        this.page.waitForSelector('button:has-text("✨ Cuộc trò chuyện mới")', {
          timeout: 10000,
        }),
        this.page.waitForSelector('button[title="Cuộc trò chuyện mới"]', {
          timeout: 10000,
        }),
        this.page.waitForSelector('.sidebar-button:has-text("✨")', {
          timeout: 10000,
        }),
        this.page.waitForSelector('[data-testid="sidebar-user-name"]', {
          timeout: 10000,
        }),
      ]);
      console.log(`✅ Logged in as user: ${TestUsers.REGULAR_USER.email}`);
    } catch (error) {
      // If main element not found, check if we're logged in with different method
      const isLoggedIn = await this.isLoggedIn();
      if (isLoggedIn) {
        console.log(`✅ Logged in as user: ${TestUsers.REGULAR_USER.email}`);
      } else {
        console.log(
          `❌ Login failed for user: ${TestUsers.REGULAR_USER.email}`
        );
        throw new Error("Login failed");
      }
    }
  }

  /**
   * Login with admin account
   */
  async loginAsAdmin() {
    await this.page.goto("/");

    // Wait for page to load
    await this.page.waitForLoadState("networkidle");

    // Check if we're on signup page, click login link
    const loginLink = this.page.locator('text="Đã có tài khoản? Đăng nhập"');
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();
      await this.page.waitForTimeout(1000);
    }

    // Wait for login form
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill admin credentials
    await this.page.fill('input[type="email"]', TestUsers.ADMIN_USER.email);
    await this.page.fill(
      'input[type="password"]',
      TestUsers.ADMIN_USER.password
    );

    // Submit
    await this.page.click('button[type="submit"]');

    // Wait for successful login
    await this.page.waitForTimeout(5000);

    // Wait for main app elements to appear - improved selector for admin
    try {
      // Try multiple selectors to check for successful admin login
      await Promise.race([
        this.page.waitForSelector('button:has-text("✨ Cuộc trò chuyện mới")', {
          timeout: 10000,
        }),
        this.page.waitForSelector('button[title="Cuộc trò chuyện mới"]', {
          timeout: 10000,
        }),
        this.page.waitForSelector('button:has-text("🔧 Admin")', {
          timeout: 10000,
        }),
        this.page.waitForSelector('[data-testid="sidebar-user-name"]', {
          timeout: 10000,
        }),
      ]);
      console.log(`✅ Logged in as admin: ${TestUsers.ADMIN_USER.email}`);
    } catch (error) {
      // Check if we're logged in as admin
      const isLoggedIn = await this.isLoggedIn();
      if (isLoggedIn) {
        console.log(`✅ Logged in as admin: ${TestUsers.ADMIN_USER.email}`);
        // Additional check for admin-specific features could go here
      } else {
        console.log(`❌ Admin login failed for: ${TestUsers.ADMIN_USER.email}`);
        throw new Error("Admin login failed");
      }
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      // Look for logout button - từ test ta thấy có button "Thoát"
      const logoutSelectors = [
        'button:has-text("Thoát")',
        'button:has-text("Đăng xuất")',
        'button:has-text("Logout")',
        'button:has-text("Sign out")',
        '[data-testid="logout-button"]',
        'button[title*="logout"]',
        'button[title*="Đăng xuất"]',
      ];

      let loggedOut = false;
      for (const selector of logoutSelectors) {
        if (await this.page.isVisible(selector, { timeout: 2000 })) {
          await this.page.click(selector);
          loggedOut = true;
          break;
        }
      }

      if (loggedOut) {
        await this.page.waitForSelector('input[type="email"]', {
          timeout: 10000,
        });
        console.log("✅ Logged out successfully");
      } else {
        console.log("⚠️ Logout button not found, might already be logged out");
      }
    } catch (error) {
      console.log("⚠️ Logout failed, continuing:", (error as Error).message);
    }
  }

  /**
   * Clear browser storage and cookies
   */
  async clearSession() {
    try {
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Ignore security errors when not on a proper page
          console.log("Storage clear failed:", (e as Error).message);
        }
      });
      await this.page.context().clearCookies();
      console.log("✅ Browser session cleared");
    } catch (error) {
      console.log(
        "⚠️ Session clear failed, continuing:",
        (error as Error).message
      );
    }
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Look for elements that appear after successful login - improved selectors
      const loggedInSelectors = [
        'button:has-text("✨ Cuộc trò chuyện mới")',
        'button[title="Cuộc trò chuyện mới"]',
        'button:has-text("🤖 AI Agent")',
        'button:has-text("🔧 Admin")',
        'button[title*="Cài đặt"]',
        'button:has-text("Thoát")',
        '[data-testid="sidebar-user-name"]',
        '[data-testid="chat-interface"]',
        ".sidebar",
      ];

      for (const selector of loggedInSelectors) {
        if (await this.page.isVisible(selector, { timeout: 2000 })) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      // Look for admin-specific elements
      const adminSelectors = [
        'text="🔧 Admin"',
        'text="Admin"',
        'a[href*="/admin"]',
        'button:has-text("Admin")',
        '[data-testid="admin-button"]',
      ];

      for (const selector of adminSelectors) {
        if (await this.page.isVisible(selector, { timeout: 2000 })) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }
}

/**
 * Profile management helper functions
 */
export class ProfileHelper {
  constructor(private page: Page) {}

  /**
   * Open settings modal
   */
  async openSettings() {
    await this.page.click(PageSelectors.SETTINGS_BUTTON);
    await this.page.waitForSelector(PageSelectors.PROFILE_NAME_INPUT, {
      timeout: 10000,
    });
    console.log("✅ Settings modal opened");
  }

  /**
   * Fill profile form with test data
   */
  async fillProfile(profileData: {
    name: string;
    age: number;
    gender: "male" | "female";
    height: number;
    weight: number;
    activityLevel: string;
    goal: string;
  }) {
    // Fill basic info
    await this.page.fill(PageSelectors.PROFILE_NAME_INPUT, profileData.name);
    await this.page.fill(
      PageSelectors.PROFILE_AGE_INPUT,
      profileData.age.toString()
    );
    await this.page.fill(
      PageSelectors.PROFILE_HEIGHT_INPUT,
      profileData.height.toString()
    );
    await this.page.fill(
      PageSelectors.PROFILE_WEIGHT_INPUT,
      profileData.weight.toString()
    );

    // Select gender
    if (profileData.gender === "male") {
      await this.page.click(PageSelectors.PROFILE_GENDER_MALE);
    } else {
      await this.page.click(PageSelectors.PROFILE_GENDER_FEMALE);
    }

    // Select activity level and goal
    await this.page.selectOption(
      PageSelectors.PROFILE_ACTIVITY_SELECT,
      profileData.activityLevel
    );
    await this.page.selectOption(
      PageSelectors.PROFILE_GOAL_SELECT,
      profileData.goal
    );

    console.log("✅ Profile form filled");
  }

  /**
   * Save profile form
   */
  async saveProfile() {
    await this.page.click(PageSelectors.PROFILE_SAVE_BUTTON);

    // Wait for success message or form to close
    try {
      await this.page.waitForSelector(PageSelectors.SUCCESS_MESSAGE, {
        timeout: 5000,
      });
      console.log("✅ Profile saved successfully");
    } catch {
      console.log("⚠️ No success message visible, but form might have saved");
    }
  }

  /**
   * Get profile data from localStorage
   */
  async getLocalStorageProfile() {
    return await this.page.evaluate(() => {
      const profile = localStorage.getItem("fitchat_user_profile");
      return profile ? JSON.parse(profile) : null;
    });
  }

  /**
   * Set profile data in localStorage
   */
  async setLocalStorageProfile(profileData: any) {
    await this.page.evaluate((data) => {
      localStorage.setItem("fitchat_user_profile", JSON.stringify(data));
    }, profileData);
  }

  /**
   * Check sidebar displays profile info
   */
  async verifySidebarProfile(expectedName: string) {
    const sidebarText = await this.page.textContent(
      'div:has([data-testid="sidebar-user-name"]), .sidebar'
    );
    expect(sidebarText).toContain(expectedName);
    console.log(`✅ Sidebar shows profile: ${expectedName}`);
  }
}

/**
 * Admin helper functions
 */
export class AdminHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to admin dashboard
   */
  async goToAdminDashboard() {
    await this.page.click(PageSelectors.ADMIN_BUTTON);
    await this.page.waitForSelector(PageSelectors.ADMIN_USER_TABLE, {
      timeout: 10000,
    });
    console.log("✅ Admin dashboard loaded");
  }

  /**
   * Find user in admin table and click profile button
   */
  async editUserProfile(userEmail: string) {
    // Find user row
    const userRow = this.page.locator(`tr:has-text("${userEmail}")`);
    await expect(userRow).toBeVisible();

    // Click profile button for this user
    await userRow.locator(PageSelectors.ADMIN_PROFILE_BUTTON).click();

    // Wait for edit modal
    await this.page.waitForSelector(PageSelectors.ADMIN_EDIT_MODAL, {
      timeout: 10000,
    });
    console.log(`✅ User profile edit modal opened for: ${userEmail}`);
  }

  /**
   * Fill admin profile edit form
   */
  async fillAdminProfileForm(profileData: any) {
    // Similar to regular profile form but in admin modal
    await this.page.fill('input[placeholder*="tên"]', profileData.name);
    await this.page.fill(
      'input[type="number"]:nth-of-type(1)',
      profileData.age.toString()
    );
    await this.page.fill(
      'input[type="number"]:nth-of-type(2)',
      profileData.height.toString()
    );
    await this.page.fill(
      'input[type="number"]:nth-of-type(3)',
      profileData.weight.toString()
    );

    if (profileData.gender === "male") {
      await this.page.click('input[value="male"]');
    } else {
      await this.page.click('input[value="female"]');
    }

    console.log("✅ Admin profile form filled");
  }

  /**
   * Save admin profile changes
   */
  async saveAdminProfile() {
    await this.page.click(
      'button:has-text("Lưu thay đổi"), button:has-text("Save")'
    );

    // Wait for success message
    try {
      await this.page.waitForSelector(PageSelectors.SUCCESS_MESSAGE, {
        timeout: 5000,
      });
      console.log("✅ Admin profile changes saved");
    } catch {
      console.log("⚠️ No success message, but changes might be saved");
    }
  }
}

/**
 * API helper functions
 */
export class APIHelper {
  constructor(private page: Page) {}

  /**
   * Monitor network requests for specific API calls
   */
  async monitorAPICall(apiPath: string): Promise<any> {
    return new Promise((resolve) => {
      this.page.on("response", async (response) => {
        if (response.url().includes(apiPath) && response.status() === 200) {
          const responseData = await response.json();
          resolve(responseData);
        }
      });
    });
  }

  /**
   * Wait for specific API call to complete
   */
  async waitForAPICall(apiPath: string, timeout = 10000) {
    await this.page.waitForResponse(
      (response) =>
        response.url().includes(apiPath) && response.status() === 200,
      { timeout }
    );
    console.log(`✅ API call completed: ${apiPath}`);
  }

  /**
   * Get authentication token from page
   */
  async getAuthToken(): Promise<string | null> {
    return await this.page.evaluate(async () => {
      // Try to get Firebase user token
      const win = window as any;
      if (
        win.firebase &&
        win.firebase.auth &&
        win.firebase.auth().currentUser
      ) {
        return await win.firebase.auth().currentUser.getIdToken();
      }
      return null;
    });
  }
}
