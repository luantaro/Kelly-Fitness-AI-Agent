// Test utilities and helper functions for Playwright E2E tests

export class TestUsers {
  static readonly REGULAR_USER = {
    email: "freeuser1@test.com",
    password: "test123456",
    displayName: "test thử",
    uid: "test-free-user-1",
  };

  static readonly ADMIN_USER = {
    email: "admin@kelly-fitness.com",
    password: "AdminKellyFitness2025!",
    displayName: "Kelly Admin",
  };
}

export class TestData {
  static readonly SAMPLE_MESSAGE = "Test message for AI chat";
  static readonly LONG_MESSAGE =
    "This is a very long test message that should test the AI response handling and make sure everything works correctly with longer content that might wrap multiple lines and test various edge cases.";

  // Profile test data
  static readonly PROFILE_BASIC = {
    name: "Test User Basic",
    age: 25,
    gender: "male" as const,
    height: 175,
    weight: 70,
    activityLevel: "moderate",
    goal: "maintain",
  };

  static readonly PROFILE_COMPLETE = {
    name: "Test User Complete",
    age: 28,
    gender: "female" as const,
    height: 165,
    weight: 60,
    activityLevel: "active",
    goal: "lose_weight",
  };

  static readonly PROFILE_ADMIN_EDIT = {
    name: "Admin Edited User",
    age: 32,
    gender: "male" as const,
    height: 180,
    weight: 85,
    activityLevel: "very_active",
    goal: "gain_muscle",
  };

  // Legacy data for compatibility
  static readonly PROFILE_DATA = {
    name: "Playwright Test User",
    age: 28,
    gender: "male" as const,
    height: 175,
    weight: 70,
    activityLevel: "moderate",
    goal: "gain_muscle",
  };

  static readonly UPDATED_PROFILE = {
    name: "Updated by Admin E2E",
    age: 35,
    gender: "female" as const,
    height: 160,
    weight: 55,
    activityLevel: "light",
    goal: "lose_weight",
  };
}

export class PageSelectors {
  // Authentication
  static readonly EMAIL_INPUT =
    'input[type="email"], input[placeholder*="email"], input[name="email"]';
  static readonly PASSWORD_INPUT =
    'input[type="password"], input[placeholder*="password"], input[name="password"]';
  static readonly LOGIN_BUTTON =
    'button:has-text("Đăng nhập"), button:has-text("Login"), button[type="submit"]';
  static readonly SIGNUP_BUTTON =
    'button:has-text("Tạo tài khoản"), button:has-text("Sign up"), button:has-text("Register")';
  static readonly SIGNUP_TO_LOGIN_LINK =
    'a:has-text("Đã có tài khoản"), a:has-text("Already have"), a:has-text("Đăng nhập")';
  static readonly LOGIN_TO_SIGNUP_LINK =
    'a:has-text("Chưa có tài khoản"), a:has-text("Don\'t have"), a:has-text("Tạo tài khoản")';
  static readonly LOGOUT_BUTTON =
    'button:has-text("Đăng xuất"), button:has-text("Logout"), [data-testid="logout-button"]';

  // Main Interface
  static readonly ADMIN_BUTTON =
    'button:has-text("Admin"), [data-testid="admin-button"], a[href*="admin"]';
  static readonly SETTINGS_BUTTON =
    'button[title*="Cài đặt"], button[title*="Settings"], button:has-text("Cài đặt"), [data-testid="settings-button"]';
  static readonly SIDEBAR_TOGGLE = 'button[aria-label="Toggle sidebar"]';

  // Profile Form
  static readonly PROFILE_NAME_INPUT =
    'input[placeholder*="Nhập tên"], input[placeholder*="tên"], input[placeholder*="name"]';
  static readonly PROFILE_AGE_INPUT =
    'input[placeholder*="Nhập tuổi"], input[placeholder*="tuổi"], input[placeholder*="age"]';
  static readonly PROFILE_HEIGHT_INPUT =
    'input[placeholder*="Nhập chiều cao"], input[placeholder*="chiều cao"], input[placeholder*="height"]';
  static readonly PROFILE_WEIGHT_INPUT =
    'input[placeholder*="Nhập cân nặng"], input[placeholder*="cân nặng"], input[placeholder*="weight"]';
  static readonly PROFILE_GENDER_MALE =
    'input[value="male"], label:has-text("Nam") input';
  static readonly PROFILE_GENDER_FEMALE =
    'input[value="female"], label:has-text("Nữ") input';
  static readonly PROFILE_ACTIVITY_SELECT =
    'select:has(option[value*="moderate"])';
  static readonly PROFILE_GOAL_SELECT =
    'select:has(option[value*="gain_muscle"])';
  static readonly PROFILE_SAVE_BUTTON =
    'button:has-text("Lưu"), button:has-text("Save")';

  // Admin Dashboard
  static readonly ADMIN_USER_TABLE = 'table, [data-testid="user-table"]';
  static readonly ADMIN_PROFILE_BUTTON =
    'button[title*="Profile"], button:has-text("👤")';
  static readonly ADMIN_EDIT_MODAL =
    '[data-testid="user-profile-edit-modal"], div:has-text("Chỉnh sửa Profile")';

  // Admin action buttons with Vietnamese titles
  static readonly ADMIN_VIEW_BUTTON = 'button[title="Xem chi tiết"]';
  static readonly ADMIN_EDIT_BUTTON = 'button[title="Chỉnh sửa"]';
  static readonly ADMIN_DELETE_BUTTON = 'button[title="Xóa"]';
  static readonly ADMIN_ACTIVATE_BUTTON = 'button[title="Kích hoạt tài khoản"]';
  static readonly ADMIN_TOGGLE_STATUS_BUTTON =
    'button[title="Vô hiệu hóa"], button[title="Kích hoạt"]';
  static readonly ADMIN_MANAGE_SUBSCRIPTION_BUTTON =
    'button[title="Quản lý Subscription"]';
  static readonly ADMIN_EDIT_PROFILE_BUTTON =
    'button[title="Chỉnh sửa Profile"]';

  // Sidebar
  static readonly SIDEBAR_USER_NAME = '[data-testid="sidebar-user-name"]';
  static readonly SIDEBAR_USER_INFO = '[data-testid="sidebar-user-info"]';

  // Messages & Notifications
  static readonly SUCCESS_MESSAGE =
    '.text-green-600, .bg-green-50, [data-testid="success-message"]';
  static readonly ERROR_MESSAGE =
    '.text-red-600, .bg-red-50, [data-testid="error-message"]';
  static readonly LOADING_SPINNER = '.animate-spin, [data-testid="loading"]';
}
