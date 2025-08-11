import { Page, Locator, expect } from "@playwright/test";

/**
 * Enhanced helper functions for stable UI interactions
 */
export class UIStabilityHelper {
  constructor(private page: Page) {}

  /**
   * Wait for element to be stable before interaction
   */
  async waitForStableElement(
    selector: string,
    timeout = 30000
  ): Promise<Locator> {
    const element = this.page.locator(selector);

    // Wait for element to exist
    await element.waitFor({ state: "attached", timeout });

    // Wait for element to be visible
    await element.waitFor({ state: "visible", timeout });

    // Wait for animations to complete
    await this.page.waitForTimeout(1500);

    // Check element is still visible and stable
    await element.waitFor({ state: "visible", timeout: 5000 });

    return element;
  }

  /**
   * Stable click with retry mechanism
   */
  async stableClick(
    selector: string,
    options: { timeout?: number; retries?: number } = {}
  ) {
    const { timeout = 30000, retries = 3 } = options;

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Attempt ${i + 1} to click: ${selector}`);

        const element = await this.waitForStableElement(selector, timeout);

        // Ensure element is enabled
        await expect(element).toBeEnabled({ timeout: 5000 });

        // Scroll element into view
        await element.scrollIntoViewIfNeeded();

        // Wait a bit more for stability
        await this.page.waitForTimeout(500);

        // Perform click
        await element.click({ force: true, timeout: 10000 });

        console.log(`✅ Successfully clicked: ${selector}`);
        return;
      } catch (error: any) {
        console.log(`❌ Click attempt ${i + 1} failed: ${error.message}`);

        if (i === retries - 1) {
          throw new Error(
            `Failed to click "${selector}" after ${retries} attempts: ${error.message}`
          );
        }

        // Wait before retry
        await this.page.waitForTimeout(2000);
      }
    }
  }

  /**
   * Stable fill input with retry mechanism
   */
  async stableFill(
    selector: string,
    value: string,
    options: { timeout?: number; retries?: number } = {}
  ) {
    const { timeout = 30000, retries = 3 } = options;

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Attempt ${i + 1} to fill: ${selector}`);

        const element = await this.waitForStableElement(selector, timeout);

        // Clear and fill
        await element.clear();
        await this.page.waitForTimeout(500);
        await element.fill(value);

        // Verify value was set
        const actualValue = await element.inputValue();
        if (actualValue === value) {
          console.log(`✅ Successfully filled: ${selector}`);
          return;
        } else {
          throw new Error(
            `Value mismatch: expected "${value}", got "${actualValue}"`
          );
        }
      } catch (error: any) {
        console.log(`❌ Fill attempt ${i + 1} failed: ${error.message}`);

        if (i === retries - 1) {
          throw new Error(
            `Failed to fill "${selector}" after ${retries} attempts: ${error.message}`
          );
        }

        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Wait for modal to appear and be interactive
   */
  async waitForModal(modalSelector: string, timeout = 30000) {
    console.log(`🔄 Waiting for modal: ${modalSelector}`);

    // Wait for modal backdrop
    await this.page.waitForSelector(".fixed.inset-0", { timeout });

    // Wait for modal content
    const modal = await this.waitForStableElement(modalSelector, timeout);

    // Wait for modal animations to complete
    await this.page.waitForTimeout(1000);

    console.log(`✅ Modal ready: ${modalSelector}`);
    return modal;
  }

  /**
   * Close modal by clicking backdrop or close button
   */
  async closeModal(closeButtonSelector?: string) {
    try {
      if (closeButtonSelector) {
        await this.stableClick(closeButtonSelector);
      } else {
        // Click backdrop to close
        await this.page.keyboard.press("Escape");
      }

      // Wait for modal to disappear
      await this.page.waitForSelector(".fixed.inset-0", {
        state: "detached",
        timeout: 10000,
      });
      console.log(`✅ Modal closed`);
    } catch (error: any) {
      console.log(`⚠️ Modal close failed: ${error.message}`);
    }
  }

  /**
   * Enhanced wait for page navigation
   */
  async waitForNavigation(expectedUrl?: string, timeout = 30000) {
    console.log(`🔄 Waiting for navigation...`);

    // Wait for navigation to complete
    await this.page.waitForLoadState("networkidle", { timeout });

    // Wait for DOM to be ready
    await this.page.waitForLoadState("domcontentloaded", { timeout });

    // Additional wait for dynamic content
    await this.page.waitForTimeout(2000);

    if (expectedUrl) {
      const currentUrl = this.page.url();
      if (!currentUrl.includes(expectedUrl)) {
        throw new Error(
          `Expected URL to contain "${expectedUrl}", but got "${currentUrl}"`
        );
      }
    }

    console.log(`✅ Navigation complete: ${this.page.url()}`);
  }

  /**
   * Enhanced selector with multiple fallbacks
   */
  async findElementSelector(
    selectors: string[],
    timeout = 30000
  ): Promise<string> {
    console.log(
      `🔍 Looking for element with selectors: ${selectors.join(", ")}`
    );

    for (const selector of selectors) {
      try {
        await this.waitForStableElement(selector, timeout / selectors.length);
        console.log(`✅ Found element with selector: ${selector}`);
        return selector;
      } catch (error) {
        console.log(`❌ Selector failed: ${selector}`);
        continue;
      }
    }

    throw new Error(
      `None of the selectors found an element: ${selectors.join(", ")}`
    );
  }
}

/**
 * Enhanced authentication helper with stability improvements
 */
export class EnhancedAuthHelper {
  private stability: UIStabilityHelper;

  constructor(private page: Page) {
    this.stability = new UIStabilityHelper(page);
  }

  async loginAsUser(
    email: string = "freetestuser1@kelly-fitness.com",
    password: string = "FreeTestPassword123!"
  ) {
    console.log(`🔐 Logging in as user: ${email}`);

    await this.page.goto("http://localhost:3002");
    await this.stability.waitForNavigation();

    // Handle signup/login page toggle
    const loginLink = this.page.locator('text="Đã có tài khoản? Đăng nhập"');
    if (await loginLink.isVisible({ timeout: 3000 })) {
      await this.stability.stableClick('text="Đã có tài khoản? Đăng nhập"');
    }

    // Fill login form with enhanced stability
    await this.stability.stableFill('input[type="email"]', email);
    await this.stability.stableFill('input[type="password"]', password);

    // Submit with stable click
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Đăng nhập")',
      ".gradient-button",
    ];

    const submitSelector = await this.stability.findElementSelector(
      submitSelectors
    );
    await this.stability.stableClick(submitSelector);

    // Wait for successful login
    await this.stability.waitForNavigation();

    // Verify login success by checking for user elements
    const userIndicators = [
      '[data-testid="sidebar-user-name"]',
      'button[title="Cuộc trò chuyện mới"]',
      '[data-testid="settings-button"]',
    ];

    await this.stability.findElementSelector(userIndicators, 15000);
    console.log(`✅ User login successful: ${email}`);
  }

  async loginAsAdmin(
    email: string = "admin@kelly-fitness.com",
    password: string = "AdminKellyFitness2025!"
  ) {
    console.log(`🔐 Logging in as admin: ${email}`);

    await this.loginAsUser(email, password);

    // Verify admin access
    const adminIndicators = [
      '[data-testid="admin-button"]',
      'button:has-text("Admin")',
      'button:has-text("🔧 Admin")',
    ];

    try {
      await this.stability.findElementSelector(adminIndicators, 10000);
      console.log(`✅ Admin login successful: ${email}`);
    } catch (error) {
      console.log(
        `⚠️ Admin indicators not found - user may not have admin permissions`
      );
    }
  }

  async logout() {
    console.log(`🚪 Logging out...`);

    try {
      const logoutSelectors = [
        '[data-testid="logout-button"]',
        'button:has-text("Đăng xuất")',
        'button[title="Đăng xuất"]',
      ];

      const logoutSelector = await this.stability.findElementSelector(
        logoutSelectors
      );
      await this.stability.stableClick(logoutSelector);
      await this.stability.waitForNavigation();

      // Verify logout by checking for login form
      await this.stability.waitForStableElement('input[type="email"]', 15000);
      console.log(`✅ Logout successful`);
    } catch (error: any) {
      console.log(`⚠️ Logout failed: ${error.message}`);
      throw error;
    }
  }

  async openSettings() {
    console.log(`⚙️ Opening settings modal...`);

    const settingsSelectors = [
      '[data-testid="settings-button"]',
      'button[title="Cài đặt"]',
      'button:has-text("Cài đặt")',
    ];

    const settingsSelector = await this.stability.findElementSelector(
      settingsSelectors
    );
    await this.stability.stableClick(settingsSelector);

    // Wait for settings modal
    const modalSelectors = [
      '[data-testid="settings-modal"]',
      ".modal-content",
      'div:has-text("Thông tin cá nhân")',
    ];

    const modalSelector = await this.stability.findElementSelector(
      modalSelectors
    );
    await this.stability.waitForModal(modalSelector);
    console.log(`✅ Settings modal opened`);
  }
}
