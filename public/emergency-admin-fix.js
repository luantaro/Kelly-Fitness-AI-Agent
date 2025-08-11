// EMERGENCY ADMIN FIX - Manual injection
console.log("🚨 Emergency admin fix loaded");

// Override trial status for admin emails
window.EMERGENCY_ADMIN_OVERRIDE = true;

// Admin emails that get full access
const ADMIN_EMAILS = [
  "taro2255@gmail.com",
  "admin@kelly-fitness.com",
  "admin@kellyfitness.com",
];

// Override useTrialStatus hook globally
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];

    // Check if user is admin by email
    const user = window.firebase?.auth?.currentUser;
    const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

    // Intercept trial status API calls for admin
    if (isAdmin && url?.includes("/api/user/trial-status")) {
      console.log("🚨 Admin detected - bypassing trial check");
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            hasAccess: true,
            status: "active",
            message: "Admin Access - Full Permissions",
            isActive: true,
            loading: false,
          }),
      });
    }

    return originalFetch.apply(this, args);
  };
}

console.log("✅ Emergency admin override active");
