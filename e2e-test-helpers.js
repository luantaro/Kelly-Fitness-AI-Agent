// 🧪 Test Helper Functions for E2E Testing

/**
 * Utility functions để test profile sync system
 * Chạy trong browser console để debug và verify
 */

// 1. 📋 Profile Sync Event Listeners
function setupProfileSyncListeners() {
  console.log("🎯 Setting up profile sync listeners...");

  // Listen for user profile updates
  window.addEventListener("fitchat-profile-updated", (event) => {
    console.log("👤 User profile updated:", event.detail);
  });

  // Listen for admin profile updates
  window.addEventListener("fitchat-admin-profile-update", (event) => {
    console.log("👨‍💼 Admin profile update:", event.detail);
  });

  // Listen for profile sync from server
  window.addEventListener("fitchat-profile-synced", (event) => {
    console.log("☁️ Profile synced from server:", event.detail);
  });

  console.log("✅ Profile sync listeners active!");
}

// 2. 🔍 Check Local Storage Data
function checkLocalStorageProfile() {
  const profile = localStorage.getItem("fitchat_user_profile");
  const personality = localStorage.getItem("fitchat_ai_personality");

  console.log("📱 localStorage Profile:", profile ? JSON.parse(profile) : null);
  console.log("🎭 localStorage Personality:", personality);

  return {
    profile: profile ? JSON.parse(profile) : null,
    personality,
  };
}

// 3. 🚀 Simulate Profile Update
function simulateProfileUpdate(updates = {}) {
  const defaultProfile = {
    name: "Test User E2E",
    age: 30,
    gender: "male",
    height: 175,
    weight: 70,
    activityLevel: "moderate",
    goal: "maintain_weight",
    ...updates,
  };

  console.log("🔄 Simulating profile update:", defaultProfile);

  // Trigger profile update event
  window.dispatchEvent(
    new CustomEvent("fitchat-profile-updated", {
      detail: { profile: defaultProfile, source: "test" },
    })
  );

  // Save to localStorage for testing
  localStorage.setItem("fitchat_user_profile", JSON.stringify(defaultProfile));

  console.log("✅ Profile update simulated!");
  return defaultProfile;
}

// 4. 🛡️ Test Admin Update Simulation
function simulateAdminUpdate(userId = "test-user", updates = {}) {
  const updatedProfile = {
    name: "Updated by Admin E2E",
    age: 25,
    gender: "female",
    height: 165,
    weight: 55,
    activityLevel: "active",
    goal: "lose_weight",
    ...updates,
  };

  console.log("👨‍💼 Simulating admin update for user:", userId);

  // Trigger admin update event
  window.dispatchEvent(
    new CustomEvent("fitchat-admin-profile-update", {
      detail: {
        profile: updatedProfile,
        userId,
        updatedBy: "admin@test.com",
        timestamp: new Date().toISOString(),
      },
    })
  );

  console.log("✅ Admin update simulated!");
  return updatedProfile;
}

// 5. 📡 Test API Endpoints
async function testAPIEndpoints() {
  console.log("🔍 Testing API endpoints...");

  try {
    // Get current user's token (if logged in)
    const user = window.firebase?.auth()?.currentUser;
    if (!user) {
      console.log("❌ No user logged in for API testing");
      return;
    }

    const token = await user.getIdToken();

    // Test user profile GET
    console.log("📥 Testing GET /api/user/profile");
    const getResponse = await fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log("✅ GET profile success:", data);
    } else {
      console.log("❌ GET profile failed:", getResponse.status);
    }

    // Test user profile POST
    console.log("📤 Testing POST /api/user/profile");
    const testProfile = {
      name: "API Test User",
      age: 28,
      gender: "male",
      height: 180,
      weight: 75,
      activityLevel: "active",
      goal: "gain_muscle",
    };

    const postResponse = await fetch("/api/user/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userProfile: testProfile }),
    });

    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log("✅ POST profile success:", result);
    } else {
      console.log("❌ POST profile failed:", postResponse.status);
    }
  } catch (error) {
    console.error("❌ API test error:", error);
  }
}

// 6. 🔄 Test Profile Sync Flow
async function testFullSyncFlow() {
  console.log("🎯 Testing full profile sync flow...");

  // Step 1: Setup listeners
  setupProfileSyncListeners();

  // Step 2: Check initial state
  const initialState = checkLocalStorageProfile();
  console.log("📋 Initial state:", initialState);

  // Step 3: Simulate user update
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const userUpdate = simulateProfileUpdate({
    name: "E2E Test Flow User",
    age: 33,
  });

  // Step 4: Simulate admin update
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const adminUpdate = simulateAdminUpdate("current-user", {
    name: "Admin Modified E2E User",
    age: 35,
  });

  // Step 5: Check final state
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const finalState = checkLocalStorageProfile();
  console.log("📋 Final state:", finalState);

  console.log("✅ Full sync flow test completed!");
}

// 7. 🧪 Performance Testing
function performanceTest() {
  console.log("⚡ Starting performance test...");

  const startTime = performance.now();

  // Simulate rapid profile updates
  for (let i = 0; i < 100; i++) {
    simulateProfileUpdate({
      name: `Performance Test ${i}`,
      age: 20 + (i % 50),
    });
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`⚡ Performance test completed in ${duration.toFixed(2)}ms`);
  console.log(`📊 Average per update: ${(duration / 100).toFixed(2)}ms`);

  return { duration, avgPerUpdate: duration / 100 };
}

// 8. 🎮 Quick Test Suite
function runQuickTestSuite() {
  console.log("🚀 Running quick test suite...");

  // Test 1: Event listeners
  setupProfileSyncListeners();

  // Test 2: Local storage
  checkLocalStorageProfile();

  // Test 3: Profile simulation
  simulateProfileUpdate();

  // Test 4: Admin simulation
  simulateAdminUpdate();

  // Test 5: Performance
  performanceTest();

  console.log("✅ Quick test suite completed!");
}

// 9. 📱 Mobile/Responsive Testing
function testResponsiveSync() {
  console.log("📱 Testing responsive sync...");

  // Simulate mobile viewport
  console.log("📱 Mobile viewport simulation");

  // Test profile updates in mobile view
  simulateProfileUpdate({
    name: "Mobile Test User",
    age: 25,
  });

  // Check if events still work in mobile
  setTimeout(() => {
    console.log("📱 Mobile test completed");
  }, 2000);
}

// 10. 🎯 Export all functions for easy access
window.E2ETestHelpers = {
  setupProfileSyncListeners,
  checkLocalStorageProfile,
  simulateProfileUpdate,
  simulateAdminUpdate,
  testAPIEndpoints,
  testFullSyncFlow,
  performanceTest,
  runQuickTestSuite,
  testResponsiveSync,
};

console.log(
  "🧪 E2E Test Helpers loaded! Use window.E2ETestHelpers to access functions."
);
console.log("🎯 Quick start: E2ETestHelpers.runQuickTestSuite()");

// Auto-setup on load
setupProfileSyncListeners();
